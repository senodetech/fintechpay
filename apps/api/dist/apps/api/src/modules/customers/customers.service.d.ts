import { MockDbService } from '../../database/mock-db.service';
import { ICustomer, CreateCustomerDto, UpdateKycStatusDto, PaginationQueryDto, PaginatedResponse, KycStatus, RiskLevel } from "@finpay360/shared-types";
export declare class CustomersService {
    private readonly mockDb;
    private readonly logger;
    constructor(mockDb: MockDbService);
    findAll(query: PaginationQueryDto & {
        kycStatus?: KycStatus;
        riskLevel?: RiskLevel;
    }): PaginatedResponse<ICustomer>;
    findById(id: string): {
        customer: ICustomer;
        accounts: import("@finpay360/shared-types").IAccount[];
        payments: import("@finpay360/shared-types").IPayment[];
        transactions: import("@finpay360/shared-types").ITransaction[];
        fraudAlerts: import("@finpay360/shared-types").IFraudAlert[];
    };
    create(dto: CreateCustomerDto, userEmail?: string): ICustomer;
    updateKyc(id: string, dto: UpdateKycStatusDto, userEmail?: string): ICustomer;
}
