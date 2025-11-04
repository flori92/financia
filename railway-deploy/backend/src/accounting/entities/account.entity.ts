import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Entité représentant un compte du plan comptable SYSCOHADA
 * 
 * Structure SYSCOHADA:
 * - Classe 1: Comptes de ressources durables
 * - Classe 2: Comptes d'actif immobilisé
 * - Classe 3: Comptes de stocks
 * - Classe 4: Comptes de tiers
 * - Classe 5: Comptes de trésorerie
 * - Classe 6: Comptes de charges
 * - Classe 7: Comptes de produits
 * - Classe 8: Comptes spéciaux
 */
@Entity('accounts')
@Unique(['companyId', 'accountNumber'])
export class Account {
  @ApiProperty({ description: 'ID unique du compte' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Numéro du compte (ex: 411, 512, 601)' })
  @Column({ length: 20 })
  accountNumber: string;

  @ApiProperty({ description: 'Nom du compte' })
  @Column({ length: 255, nullable: true })
  accountName: string;

  @ApiProperty({ description: 'Type de compte (asset, liability, equity, revenue, expense)', enum: ['asset', 'liability', 'equity', 'revenue', 'expense'] })
  @Column({
    type: 'varchar',
    length: 50,
  })
  accountType: string;

  @ApiProperty({ description: 'Classe SYSCOHADA (1-8)' })
  @Column({ type: 'int' })
  syscohadaClass: number;

  @ApiProperty({ description: 'Compte parent pour la hiérarchie', required: false })
  @ManyToOne(() => Account, (account) => account.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Account;

  @ApiProperty({ description: 'Comptes enfants', type: () => [Account] })
  @OneToMany(() => Account, (account) => account.parent)
  children: Account[];

  @ApiProperty({ description: 'Description du compte', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Le compte est-il actif?' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Solde courant du compte' })
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @ApiProperty({ description: 'Devise du compte (XOF par défaut pour OHADA)' })
  @Column({ length: 3, default: 'XOF' })
  currency: string;

  @ApiProperty({ description: 'ID de la société' })
  @Column({ type: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de dernière mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ description: 'ID Frappe pour synchronisation', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  frappeId?: string;

  @ApiProperty({ description: 'Date de dernière synchronisation avec Frappe', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  @ApiProperty({ description: 'Version pour optimistic locking' })
  @Column({ type: 'int', default: 1 })
  version: number;
}
