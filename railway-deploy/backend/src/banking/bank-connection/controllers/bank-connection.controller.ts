import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BankConnectionService } from '../services/bank-connection.service';
import { 
    BankConnection,
    BankConnectionStatus,
    BankConnectionInit,
    BankAuthComplete
} from '../interfaces/bank.interface';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bank Connections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('banking/connections')
export class BankConnectionController {
    constructor(private readonly bankConnectionService: BankConnectionService) {}

    @Post('init')
    @ApiOperation({ summary: 'Initialiser une nouvelle connexion bancaire' })
    @ApiResponse({ status: 201, description: 'Connexion initialisée avec succès' })
    async initializeConnection(
        @Body() bankInfo: BankConnectionInit
    ): Promise<BankConnection> {
        return this.bankConnectionService.initializeConnection(bankInfo);
    }

    @Post(':connectionId/complete')
    @ApiOperation({ summary: 'Compléter l\'authentification bancaire' })
    @ApiResponse({ status: 200, description: 'Authentification complétée avec succès' })
    async completeAuthentication(
        @Param('connectionId') connectionId: string,
        @Body() authData: { authCode: string }
    ): Promise<BankConnection> {
        const completeData: BankAuthComplete = {
            connectionId,
            authCode: authData.authCode
        };
        return this.bankConnectionService.completeAuthentication(completeData);
    }

    @Post(':connectionId/refresh')
    @ApiOperation({ summary: 'Rafraîchir une connexion bancaire' })
    @ApiResponse({ status: 200, description: 'Connexion rafraîchie avec succès' })
    async refreshConnection(
        @Param('connectionId') connectionId: string
    ): Promise<BankConnection> {
        return this.bankConnectionService.refreshConnection(connectionId);
    }

    @Get(':connectionId/status')
    @ApiOperation({ summary: 'Vérifier le statut d\'une connexion bancaire' })
    @ApiResponse({ status: 200, description: 'Statut récupéré avec succès' })
    async checkConnectionStatus(
        @Param('connectionId') connectionId: string
    ): Promise<BankConnectionStatus> {
        return this.bankConnectionService.checkConnectionStatus(connectionId);
    }

    @Delete(':connectionId')
    @ApiOperation({ summary: 'Supprimer une connexion bancaire' })
    @ApiResponse({ status: 200, description: 'Connexion supprimée avec succès' })
    async deleteConnection(
        @Param('connectionId') connectionId: string
    ): Promise<void> {
        await this.bankConnectionService.deleteConnection(connectionId);
    }
}