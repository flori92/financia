import { 
    Controller,
    Post,
    Get,
    Put,
    Body,
    Param,
    Query,
    UseGuards,
    HttpStatus,
    HttpException
} from '@nestjs/common';
import { BankApiService } from './services/bank-api.service';
import { CreateBankConnectionDto, BankSyncOptionsDto } from './dto/bank-api.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BankApiException } from './exceptions/bank-api.exception';

@Controller('banking')
@UseGuards(JwtAuthGuard)
export class BankApiController {
    constructor(private readonly bankApiService: BankApiService) {}

    @Post('connections')
    async initializeConnection(
        @Body() dto: CreateBankConnectionDto
    ) {
        try {
            return await this.bankApiService.initializeConnection(dto);
        } catch (error) {
            if (error instanceof BankApiException) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    @Put('connections/:connectionId/auth')
    async completeAuthentication(
        @Param('connectionId') connectionId: string,
        @Query('code') code: string
    ) {
        try {
            return await this.bankApiService.completeAuthentication(
                connectionId,
                code
            );
        } catch (error) {
            if (error instanceof BankApiException) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    @Post('connections/:connectionId/sync-accounts')
    async syncAccounts(
        @Param('connectionId') connectionId: string
    ) {
        try {
            return await this.bankApiService.syncBankAccounts(connectionId);
        } catch (error) {
            if (error instanceof BankApiException) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    @Post('accounts/:accountId/sync-transactions')
    async syncTransactions(
        @Param('accountId') accountId: string,
        @Body() options: BankSyncOptionsDto
    ) {
        try {
            const connectionId = await this.bankApiService.getConnectionIdForAccount(accountId);
            await this.bankApiService.syncTransactions(connectionId, accountId, options);
            return { message: 'Synchronisation des transactions réussie' };
        } catch (error) {
            if (error instanceof BankApiException) {
                throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
            }
            throw error;
        }
    }

    @Get('accounts/:accountId/transactions')
    async getTransactions(
        @Param('accountId') accountId: string,
        @Query() options: BankSyncOptionsDto
    ) {
        try {
            return await this.bankApiService.getTransactions(accountId, options.limit);
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la récupération des transactions',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('accounts/:accountId/anomalies')
    async getAnomalies(
        @Param('accountId') accountId: string,
        @Query('status') status?: string
    ) {
        try {
            return await this.bankApiService.getAnomalies(accountId, status);
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la récupération des anomalies',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Put('anomalies/:anomalyId')
    async updateAnomaly(
        @Param('anomalyId') anomalyId: string,
        @Body() updateDto: {
            status: 'reviewed' | 'resolved' | 'false_positive';
            resolution?: string;
        }
    ) {
        try {
            return await this.bankApiService.updateAnomaly(
                anomalyId,
                updateDto.status,
                updateDto.resolution
            );
        } catch (error) {
            throw new HttpException(
                'Erreur lors de la mise à jour de l\'anomalie',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}