import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Contact } from './contact.entity';

@Entity('crm_tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @ManyToMany(() => Contact, (contact) => contact.tags)
  contacts: Contact[];

  // Note: Removed opportunities relation to avoid circular dependency
  // This will be handled in Opportunity entity instead
}
