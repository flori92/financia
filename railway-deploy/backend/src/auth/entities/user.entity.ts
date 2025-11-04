import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from '../../companies/entities/company.entity';
import { Role } from '../../rbac/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ type: 'uuid', nullable: true, name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  password: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ default: 'user' })
  role: string; // Kept for backward compatibility

  @Column({ nullable: true, name: 'profile' })
  profile: string; // ⚠️ OBSOLÈTE - Gardé pour compatibilité ascendante uniquement

  @Column({
    type: 'simple-array',
    nullable: true,
    name: 'profiles'
  })
  profiles: string[]; // 🆕 Tableau de profils multiples

  @Column({ 
    nullable: true, 
    name: 'primary_profile',
    default: 'entrepreneur'
  })
  primaryProfile: string; // 🆕 Profil principal pour redirection initiale

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Column({ type: 'uuid', nullable: true, name: 'employee_id' })
  employeeId: string;

  @Column({ name: 'ux_level', default: 'simple' })
  uxLevel: 'simple' | 'intermediate' | 'expert';

  @Column({ default: 'fr' })
  language: string;

  @Column({ name: 'country_code', default: 'BJ' })
  countryCode: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'phone_verified', default: false })
  phoneVerified: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'two_factor_secret', nullable: true })
  twoFactorSecret: string | null;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_temp_secret', nullable: true })
  twoFactorTempSecret: string | null;

  @Column({ name: 'two_factor_backup_codes', type: 'jsonb', nullable: true })
  twoFactorBackupCodes: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
