import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { MockDbService } from '../../database/mock-db.service';
import {
  ICustomer,
  CreateCustomerDto,
  UpdateKycStatusDto,
  PaginationQueryDto,
  PaginatedResponse,
  KycStatus,
  RiskLevel,
  AuditAction,
} from '@finpay360/shared-types';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly mockDb: MockDbService) {}

  public findAll(query: PaginationQueryDto & { kycStatus?: KycStatus; riskLevel?: RiskLevel }): PaginatedResponse<ICustomer> {
    let items = [...this.mockDb.customers];

    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (c) =>
          c.firstName.toLowerCase().includes(s) ||
          c.lastName.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.customerNumber.toLowerCase().includes(s),
      );
    }

    if (query.kycStatus) {
      items = items.filter((c) => c.kycStatus === query.kycStatus);
    }

    if (query.riskLevel) {
      items = items.filter((c) => c.riskLevel === query.riskLevel);
    }

    // Sort descending by creation date
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

  public findById(id: string) {
    const customer = this.mockDb.customers.find((c) => c.id === id || c.customerNumber === id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} was not found.`);
    }

    const accounts = this.mockDb.accounts.filter((a) => a.customerId === customer.id);
    const payments = this.mockDb.payments.filter((p) => p.customerId === customer.id);
    const fraudAlerts = this.mockDb.fraudAlerts.filter((a) => a.customerId === customer.id);
    const accountIds = new Set(accounts.map((a) => a.id));
    const transactions = this.mockDb.transactions.filter((t) => accountIds.has(t.accountId));

    return {
      customer,
      accounts,
      payments: payments.slice(0, 10),
      transactions: transactions.slice(0, 15),
      fraudAlerts,
    };
  }

  public create(dto: CreateCustomerDto, userEmail?: string): ICustomer {
    const customerNumber = `CUST-${100000 + this.mockDb.customers.length + 1}`;
    const riskScore = dto.initialRiskScore || 20;
    let riskLevel = RiskLevel.LOW;
    if (riskScore > 80) riskLevel = RiskLevel.CRITICAL;
    else if (riskScore > 60) riskLevel = RiskLevel.HIGH;
    else if (riskScore > 30) riskLevel = RiskLevel.MEDIUM;

    const newCustomer: ICustomer = {
      id: `cust-${String(this.mockDb.customers.length + 1).padStart(3, '0')}`,
      customerNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      country: dto.country,
      kycStatus: KycStatus.PENDING,
      riskLevel,
      riskScore,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockDb.customers.unshift(newCustomer);

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.UPDATE_KYC,
      entityType: 'Customer',
      entityId: newCustomer.id,
      ipAddress: '127.0.0.1',
      userAgent: 'API Client',
      result: 'SUCCESS',
      afterState: newCustomer as any,
      createdAt: new Date().toISOString(),
    });

    return newCustomer;
  }

  public updateKyc(id: string, dto: UpdateKycStatusDto, userEmail?: string): ICustomer {
    const customer = this.mockDb.customers.find((c) => c.id === id || c.customerNumber === id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} was not found.`);
    }

    const beforeState = { kycStatus: customer.kycStatus };
    customer.kycStatus = dto.kycStatus;
    customer.updatedAt = new Date().toISOString();

    if (dto.kycStatus === KycStatus.REJECTED) {
      customer.riskLevel = RiskLevel.CRITICAL;
      customer.riskScore = Math.max(customer.riskScore, 85);
    } else if (dto.kycStatus === KycStatus.VERIFIED) {
      customer.riskScore = Math.max(10, customer.riskScore - 15);
    }

    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userEmail: userEmail || 'system',
      action: AuditAction.UPDATE_KYC,
      entityType: 'Customer',
      entityId: customer.id,
      ipAddress: '127.0.0.1',
      userAgent: 'API Client',
      result: 'SUCCESS',
      beforeState,
      afterState: { kycStatus: customer.kycStatus, notes: dto.notes },
      createdAt: new Date().toISOString(),
    });

    return customer;
  }
}
