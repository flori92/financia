import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Company } from '../../../companies/entities/company.entity';
import { RFQResponse } from './rfq-response.entity';

export enum RFQStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed'
}

@Entity('rfqs')
export class RFQ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  budget: string;

  @Column('text', { nullable: true })
  requirements: string;

  @Column({ nullable: true })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: RFQStatus,
    default: RFQStatus.DRAFT
  })
  status: RFQStatus;

  @Column({ nullable: true })
  referenceNumber: string;

  @ManyToOne(() => Company)
  company: Company;

  @Column()
  companyId: string;

  @OneToMany(() => RFQResponse, response => response.rfq)
  responses: RFQResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
