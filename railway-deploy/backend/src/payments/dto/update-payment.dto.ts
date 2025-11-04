import { PartialType } from '@nestjs/swagger';
import { CreatePaymentDto } from './create-payment.dto';

/**
 * DTO pour la mise à jour d'un paiement
 * Tous les champs sont optionnels (PartialType)
 */
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
