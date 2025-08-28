import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateKycStatusDto, PaginationQueryDto, KycStatus, RiskLevel, IUser } from "@finpay360/shared-types";
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    findAll(query: PaginationQueryDto & {
        kycStatus?: KycStatus;
        riskLevel?: RiskLevel;
    }): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").ICustomer>;
    findById(id: string): {
        customer: import("@finpay360/shared-types").ICustomer;
        accounts: import("@finpay360/shared-types").IAccount[];
        payments: import("@finpay360/shared-types").IPayment[];
        transactions: import("@finpay360/shared-types").ITransaction[];
        fraudAlerts: import("@finpay360/shared-types").IFraudAlert[];
    };
    create(dto: CreateCustomerDto, user: IUser): import("@finpay360/shared-types").ICustomer;
    updateKyc(id: string, dto: UpdateKycStatusDto, user: IUser): import("@finpay360/shared-types").ICustomer;
}
