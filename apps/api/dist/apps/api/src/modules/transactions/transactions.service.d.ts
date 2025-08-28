import { MockDbService } from '../../database/mock-db.service';
import { ITransaction, ILedgerEntry, TransactionFilterDto, PaginatedResponse } from "@finpay360/shared-types";
export declare class TransactionsService {
    private readonly mockDb;
    private readonly logger;
    constructor(mockDb: MockDbService);
    findAll(filter: TransactionFilterDto): PaginatedResponse<ITransaction>;
    findById(id: string): {
        transaction: ITransaction;
        ledgerEntries: ILedgerEntry[];
    };
    getLedgerEntries(transactionId: string): ILedgerEntry[];
    exportCsv(filter: TransactionFilterDto): string;
}
