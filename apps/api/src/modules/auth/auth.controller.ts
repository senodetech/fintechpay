import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Headers,
  Ip,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, AuthResponseDto, DemoUserDto, IUser } from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Authentication & OAuth2 / OIDC')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user via credentials or demo persona selector' })
  @SwaggerResponse({ status: 200, description: 'JWT Access & Refresh tokens generated' })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthResponseDto> {
    return this.authService.login(loginDto, ip || '127.0.0.1', userAgent || 'Unknown');
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Exchange valid Refresh Token for fresh Access Token' })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Invalidate current session and record logout audit log' })
  async logout(
    @CurrentUser() user: IUser,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.logout(user, ip || '127.0.0.1', userAgent || 'Unknown');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user identity and RBAC permissions' })
  async getMe(@CurrentUser() user: IUser): Promise<IUser> {
    return user;
  }

  @Get('demo-users')
  @ApiOperation({ summary: 'List available demo personas for instant FinTech role switching' })
  getDemoUsers(): DemoUserDto[] {
    return this.authService.getDemoUsers();
  }

  @Get('mock-idp/.well-known/openid-configuration')
  @ApiOperation({ summary: 'OIDC Discovery Endpoint for OpenID Connect clients' })
  getOidcConfig() {
    return this.authService.getOidcConfig();
  }
}
