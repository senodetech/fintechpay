import { MockDbService } from '../../database/mock-db.service';
import { IFraudAlert, IFraudRule, FraudFilterDto, PaginatedResponse, RiskLevel, InvestigateFraudAlertDto, UpdateFraudRuleDto, PaymentMethod, Currency } from "@finpay360/shared-types";
export interface FraudEvaluationResult {
    riskScore: number;
    riskLevel: RiskLevel;
    decision: 'ALLOW' | 'CHALLENGE' | 'REVIEW' | 'BLOCK';
    triggeredRules: Array<{
        ruleCode: string;
        ruleName: string;
        score: number;
        details: string;
    }>;
}
export declare class FraudEngineService {
    private readonly mockDb;
    private readonly logger;
    constructor(mockDb: MockDbService);
    evaluatePayment(params: {
        customerId: string;
        sourceAccountId: string;
        amount: string;
        currency: Currency;
        paymentMethod: PaymentMethod;
        metadata?: Record<string, any>;
    }): FraudEvaluationResult;
    getAlerts(filter: FraudFilterDto): PaginatedResponse<IFraudAlert>;
    getAlertById(id: string): {
        alert: IFraudAlert;
        customer?: any;
        payment?: any;
    };
    investigateAlert(id: string, dto: InvestigateFraudAlertDto, analystName?: string, analystEmail?: string): IFraudAlert;
    getRules(): IFraudRule[];
    updateRule(id: string, dto: UpdateFraudRuleDto, userEmail?: string): IFraudRule;
}
