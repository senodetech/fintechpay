import { AccountsService } from './accounts.service';
import { CreateAccountDto, UpdateAccountStatusDto, PaginationQueryDto, AccountType, AccountStatus, Currency, IUser } from "@finpay360/shared-types";
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    findAll(query: PaginationQueryDto & {
        currency?: Currency;
        accountType?: AccountType;
        status?: AccountStatus;
        customerId?: string;
    }): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").IAccount>;
    findById(id: string): import("@finpay360/shared-types").IAccount;
    findTransactions(id: string, query: PaginationQueryDto): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").ITransaction>;
    create(dto: CreateAccountDto, user: IUser): import("@finpay360/shared-types").IAccount;
    updateStatus(id: string, dto: UpdateAccountStatusDto, user: IUser): import("@finpay360/shared-types").IAccount;
}
