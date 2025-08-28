import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MockIdpService } from './mock-idp.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-fintech-jwt-key-for-local-dev-only-min-32-chars-long',
      signOptions: { expiresIn: '900s' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MockIdpService, JwtStrategy],
  exports: [AuthService, MockIdpService, JwtModule, PassportModule],
})
export class AuthModule {}
