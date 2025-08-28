import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import {
  ITransaction,
  ILedgerEntry,
  TransactionFilterDto,
  PaginatedResponse,
} from '@finpay360/shared-types';
import { MoneyMath } from '../../common/utils/money-math';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly mockDb: MockDbService) {}

  public findAll(filter: TransactionFilterDto): PaginatedResponse<ITransaction> {
    let items = [...this.mockDb.transactions];

    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(
        (t) =>
          t.transactionReference.toLowerCase().includes(s) ||
          t.description.toLowerCase().includes(s) ||
          (t.accountNumber && t.accountNumber.includes(s)),
      );
    }

    if (filter.accountId) {
      items = items.filter((t) => t.accountId === filter.accountId);
    }

    if (filter.type) {
      items = items.filter((t) => t.type === filter.type);
    }

    if (filter.status) {
      items = items.filter((t) => t.status === filter.status);
    }

    if (filter.currency) {
      items = items.filter((t) => t.currency === filter.currency);
    }

    if (filter.from) {
      const fromTime = new Date(filter.from).getTime();
      items = items.filter((t) => new Date(t.createdAt).getTime() >= fromTime);
    }

    if (filter.to) {
      const toTime = new Date(filter.to).getTime();
      items = items.filter((t) => new Date(t.createdAt).getTime() <= toTime);
    }

    if (filter.minAmount) {
      items = items.filter((t) => MoneyMath.isGreaterThanOrEqualTo(t.amount, filter.minAmount!));
    }

    if (filter.maxAmount) {
      items = items.filter((t) => MoneyMath.isLessThanOrEqualTo(t.amount, filter.maxAmount!));
    }

    // Sort order
    const sortField = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'desc';

    items.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 15;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      items: items.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  public findById(id: string): { transaction: ITransaction; ledgerEntries: ILedgerEntry[] } {
    const transaction = this.mockDb.transactions.find(
      (t) => t.id === id || t.transactionReference === id,
    );
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} was not found.`);
    }

    const ledgerEntries = this.mockDb.ledgerEntries.filter((l) => l.transactionId === transaction.id);

    return {
      transaction,
      ledgerEntries,
    };
  }

  public getLedgerEntries(transactionId: string): ILedgerEntry[] {
    return this.mockDb.ledgerEntries.filter((l) => l.transactionId === transactionId);
  }

  public exportCsv(filter: TransactionFilterDto): string {
    const paginated = this.findAll({ ...filter, limit: 10000, page: 1 });
    const headers = [
      'Transaction Reference',
      'Account Number',
      'Type',
      'Amount',
      'Currency',
      'Direction',
      'Status',
      'Balance Before',
      'Balance After',
      'Description',
      'Created At',
    ];

    const rows = paginated.items.map((t) => [
      `"${t.transactionReference}"`,
      `"${t.accountNumber || ''}"`,
      `"${t.type}"`,
      `"${t.amount}"`,
      `"${t.currency}"`,
      `"${t.direction}"`,
      `"${t.status}"`,
      `"${t.balanceBefore}"`,
      `"${t.balanceAfter}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.createdAt}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
