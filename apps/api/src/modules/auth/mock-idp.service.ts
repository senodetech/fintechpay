import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DemoUserDto, Role, IUser } from '@finpay360/shared-types';
import { MockDbService } from '../../database/mock-db.service';

@Injectable()
export class MockIdpService {
  private readonly logger = new Logger(MockIdpService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly mockDb: MockDbService,
  ) {}

  public getDemoPersonas(): DemoUserDto[] {
    return [
      {
        id: 'usr-admin-001',
        email: 'admin@finpay360.io',
        name: 'Alexander Vance (System Admin)',
        role: Role.ADMIN,
        description: 'Full administrative access to users, accounts, fraud, ledger, and settings',
      },
      {
        id: 'usr-ops-002',
        email: 'ops@finpay360.io',
        name: 'Elena Rostova (Operations Lead)',
        role: Role.OPERATIONS,
        description: 'Manages customer onboarding, accounts, payments, and refunds',
      },
      {
        id: 'usr-fin-003',
        email: 'finance@finpay360.io',
        name: 'Marcus Sterling (Finance Officer)',
        role: Role.FINANCE,
        description: 'Financial reconciliation, high-volume wire reviews, and ledger reporting',
      },
      {
        id: 'usr-risk-004',
        email: 'risk@finpay360.io',
        name: 'Sophia Chen (Risk & Fraud Analyst)',
        role: Role.RISK_ANALYST,
        description: 'Fraud alert investigation, rule weight tuning, and suspect blacklists',
      },
      {
        id: 'usr-support-005',
        email: 'support@finpay360.io',
        name: 'David Miller (Customer Support)',
        role: Role.CUSTOMER_SUPPORT,
        description: 'Assists customers, inspects account status, and initiates basic ticket reviews',
      },
      {
        id: 'usr-auditor-006',
        email: 'auditor@finpay360.io',
        name: 'Rachel Kim (Compliance Auditor)',
        role: Role.AUDITOR,
        description: 'Read-only regulatory compliance, audit log review, and SOX reporting',
      },
    ];
  }

  public getOpenIdConfiguration() {
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

  public generateTokens(user: IUser) {
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
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      tokenType: 'Bearer' as const,
      user,
    };
  }
}
