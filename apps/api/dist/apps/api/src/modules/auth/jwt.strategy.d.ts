import { Strategy } from 'passport-jwt';
import { MockDbService } from '../../database/mock-db.service';
import { IUser } from "@finpay360/shared-types";
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly mockDb;
    constructor(mockDb: MockDbService);
    validate(payload: {
        sub: string;
        email: string;
    }): Promise<IUser>;
}
export {};
