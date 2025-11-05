import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entité représentant un fournisseur
 */
@Entity('suppliers')
export class Supplier {
  @ApiProperty({ description: 'ID unique du fournisseur' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID de la société' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'Nom du fournisseur' })
  @Column({ length: 255 })
  name: string;

  @ApiProperty({ description: 'Code fournisseur', required: false })
  @Column({ length: 50, nullable: true })
  code: string;

  @ApiProperty({ description: 'Email du fournisseur', required: false })
  @Column({ length: 255, nullable: true })
  email: string;

  @ApiProperty({ description: 'Téléphone du fournisseur', required: false })
  @Column({ length: 50, nullable: true })
  phone: string;

  @ApiProperty({ description: 'Adresse du fournisseur', required: false })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ description: 'Ville', required: false })
  @Column({ length: 100, nullable: true })
  city: string;

  @ApiProperty({ description: 'Pays', required: false })
  @Column({ length: 100, nullable: true })
  country: string;

  @ApiProperty({ description: 'Code postal', required: false })
  @Column({ length: 20, nullable: true })
  postalCode: string;

  @ApiProperty({ description: 'Numéro d\'identification fiscale (NIF)', required: false })
  @Column({ length: 50, nullable: true })
  taxId: string;

  @ApiProperty({ description: 'Conditions de paiement (en jours)', required: false })
  @Column({ type: 'int', default: 30 })
  paymentTerms: number;

  @ApiProperty({ description: 'Statut du fournisseur', enum: ['active', 'inactive', 'blocked'] })
  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  })
  status: string;

  @ApiProperty({ description: 'Devise par défaut', required: false })
  @Column({ length: 3, default: 'XOF' })
  currency: string;

  @ApiProperty({ description: 'Notes supplémentaires', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Personne de contact', required: false })
  @Column({ length: 255, nullable: true })
  contactPerson: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'ID de l\'utilisateur créateur' })
  @Column({ type: 'uuid', nullable: true })
  createdBy: string;
}
