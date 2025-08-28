import { MockDbService } from '../../database/mock-db.service';
import { FraudEngineService } from '../fraud/fraud-engine.service';
import { IPayment, IPaymentEvent, ITransaction, CreatePaymentDto, RefundPaymentDto, CancelPaymentDto, PaymentFilterDto, PaginatedResponse } from "@finpay360/shared-types";
export declare class PaymentsService {
    private readonly mockDb;
    private readonly fraudEngine;
    private readonly logger;
    constructor(mockDb: MockDbService, fraudEngine: FraudEngineService);
    findAll(filter: PaymentFilterDto): PaginatedResponse<IPayment>;
    findById(id: string): {
        payment: IPayment;
        events: IPaymentEvent[];
        transactions: ITransaction[];
    };
    createPayment(dto: CreatePaymentDto, userEmail?: string): Promise<IPayment>;
    refundPayment(id: string, dto: RefundPaymentDto, userEmail?: string): Promise<IPayment>;
    cancelPayment(id: string, dto: CancelPaymentDto, userEmail?: string): Promise<IPayment>;
}
