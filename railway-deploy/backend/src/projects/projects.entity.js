const { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  client: string;

  @Column({
    type: 'enum',
    enum: ['planning', 'active', 'completed', 'on_hold', 'cancelled'],
    default: 'planning'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  })
  priority: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column('decimal')
  budget: number;

  @Column({ default: 0 })
  progress: number;

  @Column()
  projectManager: string;

  @Column({ default: 0 })
  teamSize: number;

  @Column()
  companyId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('project_tasks')
export class ProjectTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  assigneeId: string;

  @Column()
  assigneeName: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  })
  priority: string;

  @Column()
  dueDate: string;

  @Column()
  estimatedHours: number;

  @Column({ default: 0 })
  actualHours: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
