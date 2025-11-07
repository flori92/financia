import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { RedisHealthService } from '../common/services/redis-health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redisHealth: RedisHealthService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Vérifier l\'état de santé de l\'API' })
  @ApiResponse({ status: 200, description: 'API en bonne santé' })
  @ApiResponse({ status: 503, description: 'Service indisponible' })
  async check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      async (): Promise<HealthIndicatorResult> => {
        const stats = await this.redisHealth.getStats();
        return {
          redis: {
            status: stats.connected ? 'up' : 'down',
            connected: stats.connected,
            message: stats.message,
          },
        };
      },
    ]);
  }

  @Get('redis')
  @ApiOperation({ summary: 'Vérifier l\'état de Redis' })
  @ApiResponse({ status: 200, description: 'Statut Redis' })
  async checkRedis() {
    return this.redisHealth.getStats();
  }
}
