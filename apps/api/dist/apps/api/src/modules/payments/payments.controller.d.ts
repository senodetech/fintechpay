import { PaymentsService } from './payments.service';
import { CreatePaymentDto, RefundPaymentDto, CancelPaymentDto, PaymentFilterDto, IUser } from "@finpay360/shared-types";
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    findAll(filter: PaymentFilterDto): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").IPayment>;
    findById(id: string): {
        payment: import("@finpay360/shared-types").IPayment;
        events: import("@finpay360/shared-types").IPaymentEvent[];
        transactions: import("@finpay360/shared-types").ITransaction[];
    };
    create(dto: CreatePaymentDto, user: IUser): Promise<import("@finpay360/shared-types").IPayment>;
    refund(id: string, dto: RefundPaymentDto, user: IUser): Promise<import("@finpay360/shared-types").IPayment>;
    cancel(id: string, dto: CancelPaymentDto, user: IUser): Promise<import("@finpay360/shared-types").IPayment>;
}
