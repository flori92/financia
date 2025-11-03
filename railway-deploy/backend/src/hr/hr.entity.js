const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('hr_employees')
export class HREmployee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  position: string;

  @Column()
  department: string;

  @Column('decimal')
  salary: number;

  @Column()
  hireDate: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['CDI', 'CDD', 'Stage', 'Freelance'],
    default: 'CDI'
  })
  contractType: string;

  @Column()
  address: string;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('hr_payroll')
export class HRPayroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  month: string;

  @Column('decimal')
  grossSalary: number;

  @Column('decimal')
  netSalary: number;

  @Column('decimal')
  totalDeductions: number;

  @Column('json')
  deductions: {
    socialSecurity: number;
    taxes: number;
    other: number;
  };

  @Column()
  status: string;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('hr_leaves')
export class HRLeave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column({
    type: 'enum',
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity']
  })
  type: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  daysCount: number;

  @Column()
  reason: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status: string;

  @Column({ nullable: true })
  managerComment: string;

  @Column()
  requestedAt: string;

  @Column({ nullable: true })
  processedAt: string;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
