import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateKycStatusDto,
  PaginationQueryDto,
  KycStatus,
  RiskLevel,
  IUser,
} from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Customer Management & KYC')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated customer directory with search and risk filters' })
  findAll(
    @Query() query: PaginationQueryDto & { kycStatus?: KycStatus; riskLevel?: RiskLevel },
  ) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get comprehensive Customer 360 profile with accounts, payments, and risk' })
  findById(@Param('id') id: string) {
    return this.customersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new customer profile with initial KYC and risk scoring' })
  create(@Body() dto: CreateCustomerDto, @CurrentUser() user: IUser) {
    return this.customersService.create(dto, user?.email);
  }

  @Patch(':id/kyc')
  @ApiOperation({ summary: 'Update customer KYC status and recalculate risk score' })
  updateKyc(
    @Param('id') id: string,
    @Body() dto: UpdateKycStatusDto,
    @CurrentUser() user: IUser,
  ) {
    return this.customersService.updateKyc(id, dto, user?.email);
  }
}
