import { JwtService } from '@nestjs/jwt';
import { DemoUserDto, IUser } from "@finpay360/shared-types";
import { MockDbService } from '../../database/mock-db.service';
export declare class MockIdpService {
    private readonly jwtService;
    private readonly mockDb;
    private readonly logger;
    constructor(jwtService: JwtService, mockDb: MockDbService);
    getDemoPersonas(): DemoUserDto[];
    getOpenIdConfiguration(): {
        issuer: string;
        authorization_endpoint: string;
        token_endpoint: string;
        userinfo_endpoint: string;
        jwks_uri: string;
        response_types_supported: string[];
        subject_types_supported: string[];
        id_token_signing_alg_values_supported: string[];
        scopes_supported: string[];
        claims_supported: string[];
    };
    generateTokens(user: IUser): {
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        tokenType: "Bearer";
        user: IUser;
    };
}
