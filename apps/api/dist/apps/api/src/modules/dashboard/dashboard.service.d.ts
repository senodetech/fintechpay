import { MockDbService } from '../../database/mock-db.service';
import { DashboardMetricsDto } from "@finpay360/shared-types";
export declare class DashboardService {
    private readonly mockDb;
    private readonly logger;
    constructor(mockDb: MockDbService);
    getMetrics(range?: 'today' | '7d' | '30d' | '90d'): DashboardMetricsDto;
}
