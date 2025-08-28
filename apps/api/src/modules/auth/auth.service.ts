import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MockDbService } from '../../database/mock-db.service';
import { MockIdpService } from './mock-idp.service';
import { LoginDto, AuthResponseDto, Role, IUser, AuditAction } from '@finpay360/shared-types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly mockDb: MockDbService,
    private readonly mockIdp: MockIdpService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(loginDto: LoginDto, ipAddress: string, userAgent: string): Promise<AuthResponseDto> {
    let user: IUser | undefined;

    if (loginDto.role) {
      user = this.mockDb.users.find((u) => u.roles.includes(loginDto.role!));
    } else if (loginDto.email) {
      user = this.mockDb.users.find((u) => u.email.toLowerCase() === loginDto.email.toLowerCase());
    }

    if (!user) {
      this.logger.warn(`Failed login attempt for: ${loginDto.email || loginDto.role}`);
      throw new UnauthorizedException('Invalid authentication credentials.');
    }

    user.lastLoginAt = new Date().toISOString();

    // Record Audit Log
    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.USER_LOGIN,
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });

    return this.mockIdp.generateTokens(user);
  }

  public async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      const user = this.mockDb.users.find((u) => u.id === decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid user for token refresh.');
      }
      return this.mockIdp.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token is expired or invalid.');
    }
  }

  public async logout(user: IUser, ipAddress: string, userAgent: string): Promise<{ success: boolean }> {
    this.mockDb.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      action: AuditAction.USER_LOGOUT,
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
      result: 'SUCCESS',
      createdAt: new Date().toISOString(),
    });
    return { success: true };
  }

  public getDemoUsers() {
    return this.mockIdp.getDemoPersonas();
  }

  public getOidcConfig() {
    return this.mockIdp.getOpenIdConfiguration();
  }
}
