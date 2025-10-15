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
  @HealthCheck()
  @ApiOperation({ summary: 'Vérifier l\'état de santé de l\'API' })
  @ApiResponse({ status: 200, description: 'API en bonne santé' })
  @ApiResponse({ status: 503, description: 'Service indisponible' })
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
