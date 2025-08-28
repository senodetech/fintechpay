import { MockDbService } from '../../database/mock-db.service';
import { IAccount, CreateAccountDto, UpdateAccountStatusDto, PaginationQueryDto, PaginatedResponse, AccountType, AccountStatus, Currency, ITransaction } from "@finpay360/shared-types";
export declare class AccountsService {
    private readonly mockDb;
    private readonly logger;
    constructor(mockDb: MockDbService);
    findAll(query: PaginationQueryDto & {
        currency?: Currency;
        accountType?: AccountType;
        status?: AccountStatus;
        customerId?: string;
    }): PaginatedResponse<IAccount>;
    findById(id: string): IAccount;
    findTransactions(id: string, query: PaginationQueryDto): PaginatedResponse<ITransaction>;
    create(dto: CreateAccountDto, userEmail?: string): IAccount;
    updateStatus(id: string, dto: UpdateAccountStatusDto, userEmail?: string): IAccount;
}
