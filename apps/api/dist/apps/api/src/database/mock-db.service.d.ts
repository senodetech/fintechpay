import { IUser, ICustomer, IAccount, IPayment, ITransaction, ILedgerEntry, IFraudRule, IFraudAlert, INotification, IAuditLog } from "@finpay360/shared-types";
export declare class MockDbService {
    private readonly logger;
    users: IUser[];
    customers: ICustomer[];
    accounts: IAccount[];
    payments: IPayment[];
    transactions: ITransaction[];
    ledgerEntries: ILedgerEntry[];
    fraudRules: IFraudRule[];
    fraudAlerts: IFraudAlert[];
    notifications: INotification[];
    auditLogs: IAuditLog[];
    constructor();
    seedInitialData(): void;
}
