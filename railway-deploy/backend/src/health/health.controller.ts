import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Vérifier l\'état de santé de l\'API' })
  @ApiResponse({ status: 200, description: 'API en bonne santé' })
  check() {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'bms-api-gateway',
      version: '1.0.0'
    };
  }

  @Get('ping')
  @ApiOperation({ summary: 'Healthcheck simple sans vérification DB' })
  @ApiResponse({ status: 200, description: 'API répond' })
  ping() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
