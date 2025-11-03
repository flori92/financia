const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } = require('typeorm');

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

module.exports = { HREmployee, HRPayroll, HRLeave };
