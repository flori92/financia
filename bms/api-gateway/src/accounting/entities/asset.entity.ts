import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('assets')
export class Asset {
  @ApiProperty({ description: 'ID unique de l\'immobilisation' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nom de l\'immobilisation' })
  @Column({ length: 255, nullable: true })
  name: string;

  @ApiProperty({ description: 'Catégorie de l\'immobilisation' })
  @Column({ length: 100, nullable: true })
  category: string;

  @ApiProperty({ description: "Valeur d'acquisition" })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  acquisitionValue: number;

  @ApiProperty({ description: 'Valeur résiduelle' })
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  residualValue: number;

  @ApiProperty({ description: 'Date d\'acquisition' })
  @Column({ type: 'date', nullable: true })
  acquisitionDate: Date;

  @ApiProperty({ description: 'Statut', enum: ['en_service', 'amortis', 'en_cours'], default: 'en_service' })
  @Column({
    type: 'enum',
    enum: ['en_service', 'amortis', 'en_cours'],
    default: 'en_service',
  })
  status: string;

  @ApiProperty({ description: 'Lieu de stockage', required: false })
  @Column({ length: 255, nullable: true })
  location: string;

  @ApiProperty({ description: 'ID de la société' })
  @Column({ type: 'uuid', nullable: true })
  companyId: string;

  @ApiProperty({ description: 'Date de création' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  @UpdateDateColumn()
  updatedAt: Date;
}
