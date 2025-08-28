import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { MockDbService } from '../../database/mock-db.service';
import { IUser } from '@finpay360/shared-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly mockDb: MockDbService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-fintech-jwt-key-for-local-dev-only-min-32-chars-long',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<IUser> {
    const user = this.mockDb.users.find((u) => u.id === payload.sub || u.email === payload.email);
    if (!user) {
      throw new UnauthorizedException('User in token payload not found or unauthorized.');
    }
    return user;
  }
}
