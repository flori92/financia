import { PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';

/**
 * DTO pour la mise à jour d'un compte
 * Tous les champs sont optionnels (PartialType)
 */
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}
