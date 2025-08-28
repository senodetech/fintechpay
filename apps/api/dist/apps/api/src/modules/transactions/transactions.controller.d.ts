import { Response } from 'express';
import { TransactionsService } from './transactions.service';
import { TransactionFilterDto } from "@finpay360/shared-types";
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(filter: TransactionFilterDto): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").ITransaction>;
    exportCsv(filter: TransactionFilterDto, res: Response): Response<any, Record<string, any>>;
    findById(id: string): {
        transaction: import("@finpay360/shared-types").ITransaction;
        ledgerEntries: import("@finpay360/shared-types").ILedgerEntry[];
    };
    getLedger(id: string): import("@finpay360/shared-types").ILedgerEntry[];
}
