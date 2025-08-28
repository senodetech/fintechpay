import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto,
  RefundPaymentDto,
  CancelPaymentDto,
  PaymentFilterDto,
  IUser,
} from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IdempotencyInterceptor } from '../../common/interceptors/idempotency.interceptor';

@ApiTags('Payment Processing & Lifecycle')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated payment ledger with status, customer, and date filters' })
  findAll(@Query() filter: PaymentFilterDto) {
    return this.paymentsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment details, lifecycle audit events, and transaction postings' })
  findById(@Param('id') id: string) {
    return this.paymentsService.findById(id);
  }

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  @ApiOperation({ summary: 'Initiate new payment with Idempotency-Key and automated fraud screening' })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Unique client-supplied UUID to prevent duplicate payment execution',
    required: true,
  })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: IUser) {
    return this.paymentsService.createPayment(dto, user?.email);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund settled payment and execute reversing double-entry transactions' })
  refund(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: IUser,
  ) {
    return this.paymentsService.refundPayment(id, dto, user?.email);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel pending payment prior to final settlement' })
  cancel(
    @Param('id') id: string,
    @Body() dto: CancelPaymentDto,
    @CurrentUser() user: IUser,
  ) {
    return this.paymentsService.cancelPayment(id, dto, user?.email);
  }
}
