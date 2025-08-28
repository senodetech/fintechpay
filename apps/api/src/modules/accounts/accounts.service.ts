import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import {
  IAccount,
  CreateAccountDto,
  UpdateAccountStatusDto,
  PaginationQueryDto,
  PaginatedResponse,
  AccountType,
  AccountStatus,
  Currency,
  AuditAction,
  ITransaction,
} from '@finpay360/shared-types';
import { MoneyMath } from '../../common/utils/money-math';
import { MaskUtils } from '../../common/utils/mask-utils';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private readonly mockDb: MockDbService) {}

  public findAll(
    query: PaginationQueryDto & {
      currency?: Currency;
      accountType?: AccountType;
      status?: AccountStatus;
      customerId?: string;
    },
  ): PaginatedResponse<IAccount> {
    let items = [...this.mockDb.accounts];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.accountNumber.includes(s) ||
          (a.customerName && a.customerName.toLowerCase().includes(s)),
      );
    }

    if (query.customerId) {
      items = items.filter((a) => a.customerId === query.customerId);
    }

    if (query.currency) {
      items = items.filter((a) => a.currency === query.currency);
    }

    if (query.accountType) {
      items = items.filter((a) => a.accountType === query.accountType);
    }

    if (query.status) {
      items = items.filter((a) => a.status === query.status);
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = items.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  public findById(id: string): IAccount {
    const account = this.mockDb.accounts.find((a) => a.id === id || a.accountNumber === id);
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} was not found.`);
    }
    return account;
  }

  public findTransactions(id: string, query: PaginationQueryDto): PaginatedResponse<ITransaction> {
    const account = this.findById(id);
    const txs = this.mockDb.transactions.filter((t) => t.accountId === account.id);
    txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const total = txs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;

    return {
      items: txs.slice(startIndex, startIndex + limit),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  public create(dto: CreateAccountDto, userEmail?: string): IAccount {
    const customer = this.mockDb.customers.find((c) => c.id === dto.customerId);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${dto.customerId} was not found.`);
    }

    const seq = this.mockDb.accounts.length + 1;
    const rawAccNum = `4000${String(100000000000 + seq * 8371).slice(-12)}`;
    const initialDeposit = dto.initialDeposit ? MoneyMath.toDbString(dto.initialDeposit) : '0.0000';

    const newAccount: IAccount = {
      id: `acc-${String(seq).padStart(3, '0')}`,
      accountNumber: rawAccNum,
      maskedAccountNumber: MaskUtils.maskAccountNumber(rawAccNum),
      customerId: customer.id,
      customerName: `${customer.firstName} ${customer.lastName}`,
      accountType: dto.accountType,
      currency: dto.currency,
      availableBalance: initialDeposit,
      ledgerBalance: initialDeposit,
      status: AccountStatus.ACTIVE,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockDb.accounts.unshift(newAccount);

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.CREATE_PAYMENT,
      entityType: 'Account',
      entityId: newAccount.id,
      ipAddress: '127.0.0.1',
      userAgent: 'API Client',
      result: 'SUCCESS',
      afterState: newAccount as any,
      createdAt: new Date().toISOString(),
    });

    return newAccount;
  }

  public updateStatus(id: string, dto: UpdateAccountStatusDto, userEmail?: string): IAccount {
    const account = this.findById(id);
    const beforeState = { status: account.status };

    account.status = dto.status;
    account.updatedAt = new Date().toISOString();

    const action = dto.status === AccountStatus.FROZEN ? AuditAction.FREEZE_ACCOUNT : AuditAction.UNFREEZE_ACCOUNT;

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action,
      entityType: 'Account',
      entityId: account.id,
      ipAddress: '127.0.0.1',
      userAgent: 'API Client',
      result: 'SUCCESS',
      beforeState,
      afterState: { status: account.status, reason: dto.reason },
      createdAt: new Date().toISOString(),
    });

    return account;
  }
}
