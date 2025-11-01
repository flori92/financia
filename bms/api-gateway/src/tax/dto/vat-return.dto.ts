import { ApiProperty } from '@nestjs/swagger';

export class VatReturnDto {
  @ApiProperty({ description: 'Période de déclaration' })
  period: string;

  @ApiProperty({ description: 'Chiffre d\'affaires HT (base TVA collectée)' })
  taxableRevenue: number;

  @ApiProperty({ description: 'TVA collectée sur ventes' })
  vatCollected: number;

  @ApiProperty({ description: 'Achats HT (base TVA déductible)' })
  deductibleExpenses: number;

  @ApiProperty({ description: 'TVA déductible sur achats' })
  vatDeductible: number;

  @ApiProperty({ description: 'TVA nette à payer (collectée - déductible)' })
  vatDue: number;

  @ApiProperty({ description: 'Crédit TVA à reporter' })
  vatCredit: number;

  @ApiProperty({ description: 'Identifiant de déclaration' })
  declarationId: string;

  @ApiProperty({ description: 'Statut de la déclaration' })
  status: string;

  @ApiProperty({ description: 'Date limite de paiement' })
  dueDate: string;

  @ApiProperty({ description: 'Date de début de période' })
  startDate: string;

  @ApiProperty({ description: 'Date de fin de période' })
  endDate: string;

  @ApiProperty({ description: 'Détails par compte' })
  details: {
    revenues: Array<{ accountNumber: string; accountName: string; amountHT: number; vat: number }>;
    purchases: Array<{ accountNumber: string; accountName: string; amountHT: number; vat: number }>;
  };

  @ApiProperty({ description: 'Détails des revenus' })
  revenueDetails: Array<{ accountNumber: string; accountName: string; amountHT: number; vat: number }>;

  @ApiProperty({ description: 'Détails des dépenses' })
  expenseDetails: Array<{ accountNumber: string; accountName: string; amountHT: number; vat: number }>;
}
