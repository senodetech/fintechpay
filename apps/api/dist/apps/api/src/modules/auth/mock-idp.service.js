"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MockIdpService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockIdpService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const shared_types_1 = require("@finpay360/shared-types");
const mock_db_service_1 = require("../../database/mock-db.service");
let MockIdpService = MockIdpService_1 = class MockIdpService {
    jwtService;
    mockDb;
    logger = new common_1.Logger(MockIdpService_1.name);
    constructor(jwtService, mockDb) {
        this.jwtService = jwtService;
        this.mockDb = mockDb;
    }
    getDemoPersonas() {
        return [
            {
                id: 'usr-admin-001',
                email: 'admin@finpay360.io',
                name: 'Alexander Vance (System Admin)',
                role: shared_types_1.Role.ADMIN,
                description: 'Full administrative access to users, accounts, fraud, ledger, and settings',
            },
            {
                id: 'usr-ops-002',
                email: 'ops@finpay360.io',
                name: 'Elena Rostova (Operations Lead)',
                role: shared_types_1.Role.OPERATIONS,
                description: 'Manages customer onboarding, accounts, payments, and refunds',
            },
            {
                id: 'usr-fin-003',
                email: 'finance@finpay360.io',
                name: 'Marcus Sterling (Finance Officer)',
                role: shared_types_1.Role.FINANCE,
                description: 'Financial reconciliation, high-volume wire reviews, and ledger reporting',
            },
            {
                id: 'usr-risk-004',
                email: 'risk@finpay360.io',
                name: 'Sophia Chen (Risk & Fraud Analyst)',
                role: shared_types_1.Role.RISK_ANALYST,
                description: 'Fraud alert investigation, rule weight tuning, and suspect blacklists',
            },
            {
                id: 'usr-support-005',
                email: 'support@finpay360.io',
                name: 'David Miller (Customer Support)',
                role: shared_types_1.Role.CUSTOMER_SUPPORT,
                description: 'Assists customers, inspects account status, and initiates basic ticket reviews',
            },
            {
                id: 'usr-auditor-006',
                email: 'auditor@finpay360.io',
                name: 'Rachel Kim (Compliance Auditor)',
                role: shared_types_1.Role.AUDITOR,
                description: 'Read-only regulatory compliance, audit log review, and SOX reporting',
            },
        ];
    }
    getOpenIdConfiguration() {
        const issuer = process.env.OIDC_ISSUER || 'http://localhost:3000/api/v1/auth/mock-idp';
        return {
            issuer,
            authorization_endpoint: `${issuer}/authorize`,
            token_endpoint: `${issuer}/token`,
            userinfo_endpoint: `${issuer}/userinfo`,
            jwks_uri: `${issuer}/jwks.json`,
            response_types_supported: ['code', 'token', 'id_token'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256', 'HS256'],
            scopes_supported: ['openid', 'profile', 'email', 'roles'],
            claims_supported: ['sub', 'iss', 'aud', 'exp', 'email', 'name', 'roles', 'permissions'],
        };
    }
    generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            roles: user.roles,
            permissions: user.permissions,
            iss: process.env.OIDC_ISSUER || 'http://localhost:3000/api/v1/auth/mock-idp',
            aud: process.env.OIDC_AUDIENCE || 'finpay360-client',
        };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '900s' });
        const refreshToken = this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '7d' });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            tokenType: 'Bearer',
            user,
        };
    }
};
exports.MockIdpService = MockIdpService;
exports.MockIdpService = MockIdpService = MockIdpService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        mock_db_service_1.MockDbService])
], MockIdpService);
//# sourceMappingURL=mock-idp.service.js.map