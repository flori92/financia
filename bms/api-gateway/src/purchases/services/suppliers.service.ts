import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from '../dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  private readonly logger = new Logger(SuppliersService.name);

  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(companyId: string): Promise<Supplier[]> {
    return this.supplierRepository.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({
      where: { id, companyId },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier;
  }

  async create(companyId: string, createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      companyId,
      currentBalance: 0,
      isActive: createSupplierDto.isActive !== undefined ? createSupplierDto.isActive : true,
      paymentTerms: createSupplierDto.paymentTerms || 30,
      creditLimit: createSupplierDto.creditLimit || 0,
    });

    const savedSupplier = await this.supplierRepository.save(supplier);
    
    this.logger.log(`Supplier created: ${savedSupplier.name} (${savedSupplier.id})`);
    
    return savedSupplier;
  }

  async update(companyId: string, id: string, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(companyId, id);

    Object.assign(supplier, updateSupplierDto);

    const updatedSupplier = await this.supplierRepository.save(supplier);
    
    this.logger.log(`Supplier updated: ${updatedSupplier.name} (${updatedSupplier.id})`);
    
    return updatedSupplier;
  }

  async delete(companyId: string, id: string): Promise<void> {
    const supplier = await this.findOne(companyId, id);

    // Soft delete
    supplier.isActive = false;
    await this.supplierRepository.save(supplier);
    
    this.logger.log(`Supplier soft deleted: ${supplier.name} (${supplier.id})`);
  }

  async hardDelete(companyId: string, id: string): Promise<void> {
    const supplier = await this.findOne(companyId, id);
    
    await this.supplierRepository.remove(supplier);
    
    this.logger.log(`Supplier hard deleted: ${supplier.name} (${supplier.id})`);
  }

  async updateBalance(companyId: string, id: string, amount: number): Promise<Supplier> {
    const supplier = await this.findOne(companyId, id);
    
    supplier.currentBalance += amount;
    
    return this.supplierRepository.save(supplier);
  }

  async getStatistics(companyId: string): Promise<any> {
    const suppliers = await this.findAll(companyId);
    
    const active = suppliers.filter(s => s.isActive).length;
    const inactive = suppliers.filter(s => !s.isActive).length;
    const totalBalance = suppliers.reduce((sum, s) => sum + Number(s.currentBalance), 0);
    
    return {
      total: suppliers.length,
      active,
      inactive,
      totalBalance,
      averageBalance: suppliers.length > 0 ? totalBalance / suppliers.length : 0,
    };
  }
}
