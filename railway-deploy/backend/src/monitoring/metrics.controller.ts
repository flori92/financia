import { Controller, Get } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly prometheusService: PrometheusService) {}

    @Get()
    @Public()
    @ApiExcludeEndpoint()
    getMetrics() {
        return this.prometheusService.getMetrics();
    }
}