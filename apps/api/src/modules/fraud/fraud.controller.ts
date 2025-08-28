import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FraudEngineService } from './fraud-engine.service';
import {
  FraudFilterDto,
  InvestigateFraudAlertDto,
  UpdateFraudRuleDto,
  IUser,
} from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Fraud & Risk Detection Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('fraud')
export class FraudController {
  constructor(private readonly fraudService: FraudEngineService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Get paginated fraud alerts with risk level and status filters' })
  getAlerts(@Query() filter: FraudFilterDto) {
    return this.fraudService.getAlerts(filter);
  }

  @Get('alerts/:id')
  @ApiOperation({ summary: 'Get detailed fraud investigation dossier and triggered rule breakdown' })
  getAlertById(@Param('id') id: string) {
    return this.fraudService.getAlertById(id);
  }

  @Patch('alerts/:id/investigate')
  @ApiOperation({ summary: 'Submit analyst investigation decision (CONFIRMED, FALSE_POSITIVE, RESOLVED)' })
  investigate(
    @Param('id') id: string,
    @Body() dto: InvestigateFraudAlertDto,
    @CurrentUser() user: IUser,
  ) {
    const analystName = user ? `${user.firstName} ${user.lastName}` : 'Security Analyst';
    return this.fraudService.investigateAlert(id, dto, analystName, user?.email);
  }

  @Get('rules')
  @ApiOperation({ summary: 'List all active fraud detection rules and scoring weights' })
  getRules() {
    return this.fraudService.getRules();
  }

  @Patch('rules/:id')
  @ApiOperation({ summary: 'Update fraud detection rule weights and activation status' })
  updateRule(
    @Param('id') id: string,
    @Body() dto: UpdateFraudRuleDto,
    @CurrentUser() user: IUser,
  ) {
    return this.fraudService.updateRule(id, dto, user?.email);
  }
}
