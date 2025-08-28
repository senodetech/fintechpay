import { JwtService } from '@nestjs/jwt';
import { MockDbService } from '../../database/mock-db.service';
import { MockIdpService } from './mock-idp.service';
import { LoginDto, AuthResponseDto, IUser } from "@finpay360/shared-types";
export declare class AuthService {
    private readonly mockDb;
    private readonly mockIdp;
    private readonly jwtService;
    private readonly logger;
    constructor(mockDb: MockDbService, mockIdp: MockIdpService, jwtService: JwtService);
    login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponseDto>;
    refreshToken(refreshToken: string): Promise<AuthResponseDto>;
    logout(user: IUser, ipAddress: string, userAgent: string): Promise<{
        success: boolean;
    }>;
    getDemoUsers(): import("@finpay360/shared-types").DemoUserDto[];
    getOidcConfig(): {
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
}
