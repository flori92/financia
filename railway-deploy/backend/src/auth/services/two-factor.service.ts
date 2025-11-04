import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { User } from '../entities/user.entity';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Générer un secret 2FA et un QR code
   */
  async generateSecret(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    const secret = speakeasy.generateSecret({
      name: `BMS (${user.email})`,
      issuer: 'BMS',
      length: 32,
    });

    // Générer le QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Sauvegarder temporairement (pas encore activé)
    user.twoFactorTempSecret = secret.base32;
    await this.userRepository.save(user);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  /**
   * Activer 2FA après vérification du code
   */
  async enable(userId: string, token: string): Promise<{ backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorTempSecret) {
      throw new BadRequestException('Secret 2FA non trouvé');
    }

    // Vérifier le token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new BadRequestException('Code 2FA invalide');
    }

    // Générer des codes de secours
    const backupCodes = this.generateBackupCodes();

    // Activer 2FA
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorEnabled = true;
    user.twoFactorTempSecret = null;
    user.twoFactorBackupCodes = backupCodes;
    await this.userRepository.save(user);

    return { backupCodes };
  }

  /**
   * Vérifier un code 2FA
   */
  async verify(userId: string, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return false;
    }

    // Vérifier le token TOTP
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (verified) {
      return true;
    }

    // Vérifier si c'est un code de secours
    if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.includes(token)) {
      // Retirer le code de secours utilisé
      user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter((c) => c !== token);
      await this.userRepository.save(user);
      return true;
    }

    return false;
  }

  /**
   * Désactiver 2FA
   */
  async disable(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Utilisateur introuvable');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = null;
    await this.userRepository.save(user);
  }

  /**
   * Générer des codes de secours
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }
}
