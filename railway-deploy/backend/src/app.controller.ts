import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get()
  @ApiExcludeEndpoint()
  @Redirect('/api/docs', 302)
  getRoot() {
    // Redirection automatique vers Swagger
  }

  @Get('welcome')
  @ApiExcludeEndpoint()
  getWelcome() {
    return {
      name: 'BMS - Business Management System',
      version: '1.0.0',
      description: 'API Gateway pour la plateforme BMS',
      documentation: '/api/docs',
      health: '/health',
      endpoints: {
        auth: '/api/v1/auth',
        invoices: '/api/v1/invoices',
        payments: '/api/v1/payments',
        accounting: '/api/v1/accounting',
        mobilemoney: '/api/v1/mobile-money',
        nif: '/api/v1/nif',
        scoring: '/api/v1/scoring',
        loans: '/api/v1/loans',
        frappe: '/api/v1/frappe',
        sync: '/sync',
      },
      status: 'online',
      timestamp: new Date().toISOString(),
    };
  }
}
