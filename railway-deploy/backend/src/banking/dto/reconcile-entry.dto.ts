import { ApiProperty } from '@nestjs/swagger';

export class ReconcileEntryDto {
  @ApiProperty()
  companyId: string;

  @ApiProperty()
  bankTransactionId: string;

  @ApiProperty()
  journalEntryId: string;

  @ApiProperty({ required: false })
  notes?: string;
}
