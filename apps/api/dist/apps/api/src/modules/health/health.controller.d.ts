export declare class HealthController {
    check(): {
        status: string;
        info: {
            database: {
                status: string;
                type: string;
            };
            redis: {
                status: string;
                latencyMs: number;
            };
            kafka: {
                status: string;
                brokers: string[];
            };
            memory: {
                rssMb: number;
                heapUsedMb: number;
            };
        };
        timestamp: string;
    };
    live(): {
        status: string;
        uptimeSeconds: number;
    };
    ready(): {
        status: string;
        acceptingTraffic: boolean;
    };
}
