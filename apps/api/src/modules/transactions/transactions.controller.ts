import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { TransactionFilterDto } from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Transaction Ledger & Journal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated transaction ledger entries with multi-attribute filtering' })
  findAll(@Query() filter: TransactionFilterDto) {
    return this.transactionsService.findAll(filter);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Export filtered immutable ledger transaction records to CSV' })
  exportCsv(@Query() filter: TransactionFilterDto, @Res() res: Response) {
    const csv = this.transactionsService.exportCsv(filter);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
    return res.send(csv);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details and linked debit/credit ledger postings' })
  findById(@Param('id') id: string) {
    return this.transactionsService.findById(id);
  }

  @Get(':id/ledger')
  @ApiOperation({ summary: 'Get double-entry balanced debit/credit lines for transaction' })
  getLedger(@Param('id') id: string) {
    return this.transactionsService.getLedgerEntries(id);
  }
}
