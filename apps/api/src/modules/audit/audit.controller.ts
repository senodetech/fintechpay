import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { PaginationQueryDto, AuditAction } from '@finpay360/shared-types';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Compliance & Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated append-only security and financial audit trail' })
  findAll(
    @Query()
    query: PaginationQueryDto & { action?: AuditAction; entityType?: string; userEmail?: string },
  ) {
    return this.auditService.findAll(query);
  }
}
