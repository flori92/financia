import { ApiProperty } from '@nestjs/swagger';

export class VatReturnDto {
  @ApiProperty({ description: 'Chiffre d\'affaires HT (base TVA collectée)' })
  revenueHT: number;

  @ApiProperty({ description: 'TVA collectée sur ventes' })
  vatCollected: number;

  @ApiProperty({ description: 'Achats HT (base TVA déductible)' })
  purchasesHT: number;

  @ApiProperty({ description: 'TVA déductible sur achats' })
  vatDeductible: number;

  @ApiProperty({ description: 'TVA nette à payer (collectée - déductible)' })
  vatNet: number;

  @ApiProperty({ description: 'Date de début de période' })
  startDate: string;

  @ApiProperty({ description: 'Date de fin de période' })
  endDate: string;

  @ApiProperty({ description: 'Détails par compte' })
  details: {
    revenues: Array<{ accountNumber: string; accountName: string; amountHT: number; vat: number }>;
    purchases: Array<{ accountNumber: string; accountName: string; amountHT: number; vat: number }>;
  };
}
