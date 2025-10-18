import { IsString, IsNotEmpty, IsOptional, IsDate, IsNumber, IsEnum } from 'class-validator';

export class CreateBankConnectionDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    bankCode: string;
}

export class BankAccountDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsNumber()
    balance: number;

    @IsString()
    @IsOptional()
    iban?: string;

    @IsString()
    @IsOptional()
    bic?: string;
}

export class BankTransactionDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsDate()
    date: Date;

    @IsNumber()
    amount: number;

    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(['credit', 'debit'])
    type: 'credit' | 'debit';

    @IsString()
    @IsOptional()
    category?: string;

    @IsEnum(['pending', 'posted', 'cancelled'])
    status: 'pending' | 'posted' | 'cancelled';
}

export class BankSyncOptionsDto {
    @IsDate()
    @IsOptional()
    fromDate?: Date;

    @IsDate()
    @IsOptional()
    toDate?: Date;

    @IsNumber()
    @IsOptional()
    limit?: number;
}