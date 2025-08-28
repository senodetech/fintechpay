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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fraud_engine_service_1 = require("./fraud-engine.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FraudController = class FraudController {
    fraudService;
    constructor(fraudService) {
        this.fraudService = fraudService;
    }
    getAlerts(filter) {
        return this.fraudService.getAlerts(filter);
    }
    getAlertById(id) {
        return this.fraudService.getAlertById(id);
    }
    investigate(id, dto, user) {
        const analystName = user ? `${user.firstName} ${user.lastName}` : 'Security Analyst';
        return this.fraudService.investigateAlert(id, dto, analystName, user?.email);
    }
    getRules() {
        return this.fraudService.getRules();
    }
    updateRule(id, dto, user) {
        return this.fraudService.updateRule(id, dto, user?.email);
    }
};
exports.FraudController = FraudController;
__decorate([
    (0, common_1.Get)('alerts'),
    (0, swagger_1.ApiOperation)({ summary: 'Get paginated fraud alerts with risk level and status filters' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FraudController.prototype, "getAlerts", null);
__decorate([
    (0, common_1.Get)('alerts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed fraud investigation dossier and triggered rule breakdown' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FraudController.prototype, "getAlertById", null);
__decorate([
    (0, common_1.Patch)('alerts/:id/investigate'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit analyst investigation decision (CONFIRMED, FALSE_POSITIVE, RESOLVED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FraudController.prototype, "investigate", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, swagger_1.ApiOperation)({ summary: 'List all active fraud detection rules and scoring weights' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FraudController.prototype, "getRules", null);
__decorate([
    (0, common_1.Patch)('rules/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update fraud detection rule weights and activation status' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FraudController.prototype, "updateRule", null);
exports.FraudController = FraudController = __decorate([
    (0, swagger_1.ApiTags)('Fraud & Risk Detection Engine'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('fraud'),
    __metadata("design:paramtypes", [fraud_engine_service_1.FraudEngineService])
], FraudController);
//# sourceMappingURL=fraud.controller.js.map