import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Employee, EmployeeStatus, ContractType } from '../entities/employee.entity';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Créer un nouvel employé
   */
  async create(createEmployeeDto: CreateEmployeeDto, companyId: string): Promise<Employee> {
    // Vérifier que l'entreprise existe
    const company = await this.companiesRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('Entreprise non trouvée');
    }

    // Vérifier que le numéro d'employé est unique
    const existingEmployee = await this.employeesRepository.findOne({
      where: {
        employeeNumber: createEmployeeDto.employeeNumber,
        companyId,
      },
    });
    if (existingEmployee) {
      throw new BadRequestException('Ce numéro d\'employé existe déjà');
    }

    // Vérifier l'utilisateur si spécifié
    if (createEmployeeDto.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: createEmployeeDto.userId },
      });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
    }

    // Calculer les jours de congés restants
    const remainingLeaveDays = (createEmployeeDto.annualLeaveDays || 0) - 0;

    const employee = this.employeesRepository.create({
      ...createEmployeeDto,
      companyId,
      remainingLeaveDays,
      usedLeaveDays: 0,
      lastLeaveUpdate: new Date(),
    });

    return await this.employeesRepository.save(employee);
  }

  /**
   * Lister tous les employés d'une entreprise
   */
  async findAll(
    companyId: string,
    options: {
      status?: EmployeeStatus;
      department?: string;
      contractType?: ContractType;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ employees: Employee[]; total: number }> {
    const {
      status,
      department,
      contractType,
      search,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.employeesRepository
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.manager', 'manager')
      .leftJoinAndSelect('employee.user', 'user')
      .where('employee.companyId = :companyId', { companyId });

    if (status) {
      queryBuilder.andWhere('employee.status = :status', { status });
    }

    if (department) {
      queryBuilder.andWhere('employee.department = :department', { department });
    }

    if (contractType) {
      queryBuilder.andWhere('employee.contractType = :contractType', { contractType });
    }

    if (search) {
      queryBuilder.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search OR employee.employeeNumber ILIKE :search OR employee.position ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [employees, total] = await queryBuilder
      .orderBy('employee.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { employees, total };
  }

  /**
   * Trouver un employé par son ID
   */
  async findOne(id: string, companyId: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id, companyId },
      relations: ['manager', 'user', 'timesheets', 'leaveRequests', 'payrollRecords'],
    });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    return employee;
  }

  /**
   * Mettre à jour un employé
   */
  async update(
    id: string,
    updateEmployeeDto: Partial<CreateEmployeeDto>,
    companyId: string
  ): Promise<Employee> {
    const employee = await this.findOne(id, companyId);

    // Vérifier l'unicité du numéro d'employé si modifié
    if (updateEmployeeDto.employeeNumber && updateEmployeeDto.employeeNumber !== employee.employeeNumber) {
      const existingEmployee = await this.employeesRepository.findOne({
        where: {
          employeeNumber: updateEmployeeDto.employeeNumber,
          companyId,
        },
      });
      if (existingEmployee) {
        throw new BadRequestException('Ce numéro d\'employé existe déjà');
      }
    }

    // Mettre à jour les jours de congés si le total annuel change
    if (updateEmployeeDto.annualLeaveDays !== undefined) {
      updateEmployeeDto.remainingLeaveDays = updateEmployeeDto.annualLeaveDays - employee.usedLeaveDays;
      updateEmployeeDto.lastLeaveUpdate = new Date();
    }

    Object.assign(employee, updateEmployeeDto);
    return await this.employeesRepository.save(employee);
  }

  /**
   * Supprimer un employé (soft delete via statut)
   */
  async remove(id: string, companyId: string): Promise<void> {
    const employee = await this.findOne(id, companyId);
    
    // Soft delete : marquer comme inactif plutôt que supprimer
    employee.status = EmployeeStatus.TERMINATED;
    employee.endDate = new Date();
    await this.employeesRepository.save(employee);
  }

  /**
   * Activer/Désactiver un employé
   */
  async toggleStatus(id: string, companyId: string): Promise<Employee> {
    const employee = await this.findOne(id, companyId);

    if (employee.status === EmployeeStatus.ACTIVE) {
      employee.status = EmployeeStatus.INACTIVE;
    } else if (employee.status === EmployeeStatus.INACTIVE) {
      employee.status = EmployeeStatus.ACTIVE;
    } else {
      throw new BadRequestException('Impossible de modifier le statut de cet employé');
    }

    return await this.employeesRepository.save(employee);
  }

  /**
   * Mettre à jour le solde de congés
   */
  async updateLeaveBalance(
    id: string,
    companyId: string,
    daysUsed: number,
    operation: 'add' | 'subtract' = 'add'
  ): Promise<Employee> {
    const employee = await this.findOne(id, companyId);

    if (operation === 'add') {
      employee.usedLeaveDays += daysUsed;
    } else {
      employee.usedLeaveDays = Math.max(0, employee.usedLeaveDays - daysUsed);
    }

    employee.remainingLeaveDays = employee.annualLeaveDays - employee.usedLeaveDays;
    employee.lastLeaveUpdate = new Date();

    return await this.employeesRepository.save(employee);
  }

  /**
   * Obtenir les statistiques des employés
   */
  async getStats(companyId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    byDepartment: Record<string, number>;
    byContractType: Record<string, number>;
  }> {
    const employees = await this.employeesRepository.find({
      where: { companyId },
    });

    const stats = {
      total: employees.length,
      active: employees.filter(e => e.status === EmployeeStatus.ACTIVE).length,
      inactive: employees.filter(e => e.status === EmployeeStatus.INACTIVE).length,
      onLeave: employees.filter(e => e.status === EmployeeStatus.ON_LEAVE).length,
      byDepartment: {} as Record<string, number>,
      byContractType: {} as Record<string, number>,
    };

    // Statistiques par département
    employees.forEach(employee => {
      const dept = employee.department || 'Non spécifié';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
    });

    // Statistiques par type de contrat
    employees.forEach(employee => {
      stats.byContractType[employee.contractType] = (stats.byContractType[employee.contractType] || 0) + 1;
    });

    return stats;
  }

  /**
   * Lister les managers disponibles
   */
  async findManagers(companyId: string): Promise<Employee[]> {
    return await this.employeesRepository.find({
      where: {
        companyId,
        position: Like('%manager%'),
      },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  /**
   * Associer un utilisateur à un employé
   */
  async associateUser(
    employeeId: string,
    userId: string,
    companyId: string
  ): Promise<Employee> {
    const employee = await this.findOne(employeeId, companyId);
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    employee.userId = userId;
    return await this.employeesRepository.save(employee);
  }

  /**
   * Désassocier un utilisateur d'un employé
   */
  async dissociateUser(employeeId: string, companyId: string): Promise<Employee> {
    const employee = await this.findOne(employeeId, companyId);
    employee.userId = null;
    return await this.employeesRepository.save(employee);
  }
}
