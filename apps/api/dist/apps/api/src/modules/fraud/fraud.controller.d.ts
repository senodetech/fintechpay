import { FraudEngineService } from './fraud-engine.service';
import { FraudFilterDto, InvestigateFraudAlertDto, UpdateFraudRuleDto, IUser } from "@finpay360/shared-types";
export declare class FraudController {
    private readonly fraudService;
    constructor(fraudService: FraudEngineService);
    getAlerts(filter: FraudFilterDto): import("@finpay360/shared-types").PaginatedResponse<import("@finpay360/shared-types").IFraudAlert>;
    getAlertById(id: string): {
        alert: import("@finpay360/shared-types").IFraudAlert;
        customer?: any;
        payment?: any;
    };
    investigate(id: string, dto: InvestigateFraudAlertDto, user: IUser): import("@finpay360/shared-types").IFraudAlert;
    getRules(): import("@finpay360/shared-types").IFraudRule[];
    updateRule(id: string, dto: UpdateFraudRuleDto, user: IUser): import("@finpay360/shared-types").IFraudRule;
}
