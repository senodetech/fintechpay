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
import { AccountsService } from './accounts.service';
import {
  CreateAccountDto,
  UpdateAccountStatusDto,
  PaginationQueryDto,
  AccountType,
  AccountStatus,
  Currency,
  IUser,
} from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Account Management & Balances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated accounts with currency, type, and status filtering' })
  findAll(
    @Query()
    query: PaginationQueryDto & {
      currency?: Currency;
      accountType?: AccountType;
      status?: AccountStatus;
      customerId?: string;
    },
  ) {
    return this.accountsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account details, masked account number, and balances' })
  findById(@Param('id') id: string) {
    return this.accountsService.findById(id);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get paginated transaction history for a specific account' })
  findTransactions(@Param('id') id: string, @Query() query: PaginationQueryDto) {
    return this.accountsService.findTransactions(id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new bank/merchant/wallet account for a customer' })
  create(@Body() dto: CreateAccountDto, @CurrentUser() user: IUser) {
    return this.accountsService.create(dto, user?.email);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Freeze or unfreeze an account with reason tracking' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAccountStatusDto,
    @CurrentUser() user: IUser,
  ) {
    return this.accountsService.updateStatus(id, dto, user?.email);
  }
}
