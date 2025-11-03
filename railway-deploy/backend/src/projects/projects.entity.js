const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } = require('typeorm');

@Entity('projects')
class Project {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  name;

  @Column()
  description;

  @Column()
  clientId;

  @Column()
  clientName;

  @Column('decimal')
  budget;

  @Column('decimal', { default: 0 })
  spent;

  @Column()
  startDate;

  @Column()
  endDate;

  @Column({
    type: 'enum',
    enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
    default: 'planning'
  })
  status;

  @Column({ default: 0 })
  progress;

  @Column()
  projectManager;

  @Column('json')
  teamMembers;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

@Entity('project_tasks')
class ProjectTask {
  @PrimaryGeneratedColumn('uuid')
  id;

  @Column()
  projectId;

  @Column()
  title;

  @Column()
  description;

  @Column()
  assignedTo;

  @Column({
    type: 'enum',
    enum: ['todo', 'in_progress', 'review', 'completed'],
    default: 'todo'
  })
  status;

  @Column()
  priority;

  @Column()
  dueDate;

  @Column({ default: 0 })
  estimatedHours;

  @Column({ default: 0 })
  actualHours;

  @Column({ nullable: true })
  completedAt;

  @Column()
  companyId;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}

module.exports = { Project, ProjectTask };
