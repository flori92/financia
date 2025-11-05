import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  position: string;

  @Column()
  department: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  baseSalary: number;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'terminated';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
