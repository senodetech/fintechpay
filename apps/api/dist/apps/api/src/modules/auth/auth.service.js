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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mock_db_service_1 = require("../../database/mock-db.service");
const mock_idp_service_1 = require("./mock-idp.service");
const shared_types_1 = require("@finpay360/shared-types");
let AuthService = AuthService_1 = class AuthService {
    mockDb;
    mockIdp;
    jwtService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(mockDb, mockIdp, jwtService) {
        this.mockDb = mockDb;
        this.mockIdp = mockIdp;
        this.jwtService = jwtService;
    }
    async login(loginDto, ipAddress, userAgent) {
        let user;
        if (loginDto.role) {
            user = this.mockDb.users.find((u) => u.roles.includes(loginDto.role));
        }
        else if (loginDto.email) {
            user = this.mockDb.users.find((u) => u.email.toLowerCase() === loginDto.email.toLowerCase());
        }
        if (!user) {
            this.logger.warn(`Failed login attempt for: ${loginDto.email || loginDto.role}`);
            throw new common_1.UnauthorizedException('Invalid authentication credentials.');
        }
        user.lastLoginAt = new Date().toISOString();
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userId: user.id,
            userEmail: user.email,
            action: shared_types_1.AuditAction.USER_LOGIN,
            entityType: 'User',
            entityId: user.id,
            ipAddress,
            userAgent,
            result: 'SUCCESS',
            createdAt: new Date().toISOString(),
        });
        return this.mockIdp.generateTokens(user);
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = this.jwtService.verify(refreshToken);
            const user = this.mockDb.users.find((u) => u.id === decoded.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid user for token refresh.');
            }
            return this.mockIdp.generateTokens(user);
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token is expired or invalid.');
        }
    }
    async logout(user, ipAddress, userAgent) {
        this.mockDb.auditLogs.unshift({
            id: `audit-${Date.now()}`,
            userId: user.id,
            userEmail: user.email,
            action: shared_types_1.AuditAction.USER_LOGOUT,
            entityType: 'User',
            entityId: user.id,
            ipAddress,
            userAgent,
            result: 'SUCCESS',
            createdAt: new Date().toISOString(),
        });
        return { success: true };
    }
    getDemoUsers() {
        return this.mockIdp.getDemoPersonas();
    }
    getOidcConfig() {
        return this.mockIdp.getOpenIdConfiguration();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mock_db_service_1.MockDbService,
        mock_idp_service_1.MockIdpService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map