import { Controller, Post, Get, Body, Param, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyAuthGuard } from '../../auth/guards/company-auth.guard';
import { ReconciliationService } from './reconciliation.service';
import { StartReconciliationDto } from './dto/start-reconciliation.dto';
import { ValidateMatchDto } from './dto/validate-match.dto';

@ApiTags('Banking - Reconciliation')
@Controller('banking/reconciliation')
@UseGuards(JwtAuthGuard, CompanyAuthGuard)
@ApiBearerAuth()
export class ReconciliationController {
    constructor(
        private readonly reconciliationService: ReconciliationService
    ) {}

    @Post(':companyId/accounts/:accountId/reconcile')
    @ApiOperation({ summary: 'Start reconciliation process for a bank account' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns reconciliation statistics'
    })
    async startReconciliation(
        @Param('companyId') companyId: string,
        @Param('accountId') accountId: string,
        @Body(ValidationPipe) dto: StartReconciliationDto
    ) {
        return this.reconciliationService.reconcileTransactions(
            companyId,
            accountId,
            dto.dateRange
        );
    }

    @Post('matches/:matchId/validate')
    @ApiOperation({ summary: 'Validate or reject a reconciliation match' })
    @ApiResponse({ 
        status: 200, 
        description: 'Match status updated successfully'
    })
    async validateMatch(
        @Param('matchId') matchId: string,
        @Body(ValidationPipe) dto: ValidateMatchDto
    ) {
        return this.reconciliationService.validateMatch(
            matchId,
            dto.approved
        );
    }

    @Get(':companyId/accounts/:accountId/unmatched')
    @ApiOperation({ summary: 'Get unmatched transactions for a bank account' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns list of unmatched transactions'
    })
    async getUnmatchedTransactions(
        @Param('companyId') companyId: string,
        @Param('accountId') accountId: string
    ) {
        return this.reconciliationService.getUnmatchedTransactions(
            companyId,
            accountId
        );
    }

    @Get('transactions/:transactionId/suggestions')
    @ApiOperation({ summary: 'Get matching suggestions for a transaction' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns list of potential matches'
    })
    async getMatchSuggestions(
        @Param('transactionId') transactionId: string
    ) {
        return this.reconciliationService.getMatchSuggestions(transactionId);
    }
}