import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Executive Dashboard & Telemetry')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get unified executive KPIs, ECharts time-series trends, and live telemetry' })
  getMetrics(@Query('range') range?: 'today' | '7d' | '30d' | '90d') {
    return this.dashboardService.getMetrics(range || '30d');
  }
}
