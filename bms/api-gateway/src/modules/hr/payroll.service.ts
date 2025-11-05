import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from './entities/employee.entity';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepo: Repository<Payroll>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
  ) {}

  async getPayrolls(companyId: string) {
    return this.payrollRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPayroll(id: string) {
    return this.payrollRepo.findOne({ where: { id } });
  }

  async calculatePayroll(companyId: string, employeeId: string, period: string, workedDays: number = 22, bonuses: number = 0, deductions: number = 0): Promise<Payroll> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });

    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    const baseSalary = Number(employee.baseSalary);
    const dailyRate = baseSalary / 22; // Standard 22 working days per month
    const grossSalary = dailyRate * workedDays + bonuses - deductions;
    const socialCharges = grossSalary * 0.22; // 22% for social charges
    const tax = this.calculateTax(grossSalary);
    const netSalary = grossSalary - socialCharges - tax;

    const payroll = this.payrollRepo.create({
      companyId,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      period,
      baseSalary,
      workedDays,
      grossSalary,
      bonuses,
      deductions,
      socialCharges,
      tax,
      netSalary,
      status: 'calculated',
    });

    return this.payrollRepo.save(payroll);
  }

  async updatePayroll(id: string, data: Partial<Payroll>) {
    await this.payrollRepo.update(id, data);
    return this.payrollRepo.findOne({ where: { id } });
  }

  async deletePayroll(id: string) {
    await this.payrollRepo.delete(id);
    return { success: true, message: 'Paie supprimée' };
  }

  async generatePayslip(payrollId: string): Promise<any> {
    const payroll = await this.payrollRepo.findOne({ where: { id: payrollId } });
    if (!payroll) {
      throw new Error('Paie non trouvée');
    }
    return { id: `PAYSLIP-${Date.now()}`, payrollId, generatedAt: new Date(), ...payroll };
  }

  async exportDSN(companyId: string, period: string): Promise<string> {
    const payrolls = await this.payrollRepo.find({
      where: { companyId, period },
    });
    return this.generateDSN(payrolls);
  }

  private calculateTax(gross: number): number {
    // Tax brackets for FCFA (simplified)
    if (gross < 10000) return 0;
    if (gross < 25000) return gross * 0.11;
    if (gross < 70000) return gross * 0.30;
    return gross * 0.41;
  }

  private generateDSN(payrolls: Payroll[]): string {
    // Simplified DSN generation - in production this would follow URSSAF format
    let dsn = 'DSN Export\n';
    dsn += `Generated: ${new Date().toISOString()}\n\n`;

    payrolls.forEach(p => {
      dsn += `Employee: ${p.employeeName}\n`;
      dsn += `Period: ${p.period}\n`;
      dsn += `Gross: ${p.grossSalary} FCFA\n`;
      dsn += `Net: ${p.netSalary} FCFA\n\n`;
    });

    return dsn;
  }
}
