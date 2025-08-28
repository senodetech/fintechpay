import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto, DemoUserDto, IUser } from "@finpay360/shared-types";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, ip: string, userAgent: string): Promise<AuthResponseDto>;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    logout(user: IUser, ip: string, userAgent: string): Promise<{
        success: boolean;
    }>;
    getMe(user: IUser): Promise<IUser>;
    getDemoUsers(): DemoUserDto[];
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
