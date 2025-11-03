const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } = require('typeorm');

@Entity('hr_employees')
class HREmployee {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  firstName;

  @Column()
  lastName;

  @Column()
  email;

  @Column()
  phone;

  @Column()
  position;

  @Column()
  department;

  @Column('decimal')
  salary;

  @Column()
  hireDate;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  })
  status;

  @Column({
    type: 'enum',
    enum: ['CDI', 'CDD', 'Stage', 'Freelance'],
    default: 'CDI'
  })
  contractType;

  @Column()
  address;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('hr_payroll')
class HRPayroll {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId;

  @Column()
  month;

  @Column('decimal')
  grossSalary;

  @Column('decimal')
  netSalary;

  @Column('decimal')
  totalDeductions;

  @Column('json')
  deductions;

  @Column()
  status;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('hr_leaves')
class HRLeave {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId;

  @Column({
    type: 'enum',
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity']
  })
  type;

  @Column()
  startDate;

  @Column()
  endDate;

  @Column()
  daysCount;

  @Column()
  reason;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  })
  status;

  @Column({ nullable: true })
  managerComment;

  @Column()
  requestedAt;

  @Column({ nullable: true })
  processedAt;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('hr_leave_balances')
class HRLeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId;

  @Column({
    type: 'enum',
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity']
  })
  type;

  @Column('decimal')
  totalDays;

  @Column('decimal')
  usedDays;

  @Column('decimal')
  remainingDays;

  @Column()
  year;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('hr_timesheets')
class HRTimesheet {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId;

  @Column()
  weekStartDate;

  @Column()
  weekEndDate;

  @Column('decimal')
  totalHours;

  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  })
  status;

  @Column('json')
  projects;

  @Column({ nullable: true })
  submittedAt;

  @Column({ nullable: true })
  approvedAt;

  @Column({ nullable: true })
  approvedBy;

  @Column({ nullable: true })
  comments;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('hr_expenses')
class HRExpense {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  employeeId;

  @Column()
  description;

  @Column('decimal')
  amount;

  @Column({
    type: 'enum',
    enum: ['transport', 'meals', 'accommodation', 'mission', 'other']
  })
  type;

  @Column()
  date;

  @Column({
    type: 'enum',
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  })
  status;

  @Column()
  projectId;

  @Column({ nullable: true })
  receiptUrl;

  @Column({ nullable: true })
  submittedAt;

  @Column({ nullable: true })
  approvedAt;

  @Column({ nullable: true })
  approvedBy;

  @Column({ nullable: true })
  comments;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { 
  HREmployee, 
  HRPayroll, 
  HRLeave, 
  HRLeaveBalance,
  HRTimesheet,
  HRExpense 
};
