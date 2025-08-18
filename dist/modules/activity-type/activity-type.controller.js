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
exports.ActivityTypeController = void 0;
const common_1 = require("@nestjs/common");
const activity_type_service_1 = require("./activity-type.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ActivityTypeController = class ActivityTypeController {
    constructor(activityTypeService) {
        this.activityTypeService = activityTypeService;
    }
    async create(activityTypeData) {
        return this.activityTypeService.create(activityTypeData);
    }
    async findAll() {
        return this.activityTypeService.findAll();
    }
    async findOne(id) {
        return this.activityTypeService.findById(id);
    }
    async update(id, updateData) {
        return this.activityTypeService.update(id, updateData);
    }
    async delete(id) {
        return this.activityTypeService.delete(id);
    }
    async seedActivityTypes() {
        return this.activityTypeService.seedActivityTypes();
    }
};
exports.ActivityTypeController = ActivityTypeController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create activity type", description: "Creates a new activity type." }),
    (0, swagger_1.ApiBody)({ schema: { example: { name: "Visit", description: "Sales rep visit" } } }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Activity type created." }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityTypeController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ActivityTypeController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ActivityTypeController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ActivityTypeController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)("seed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityTypeController.prototype, "seedActivityTypes", null);
exports.ActivityTypeController = ActivityTypeController = __decorate([
    (0, swagger_1.ApiTags)("Activity Types"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("activity-types"),
    __metadata("design:paramtypes", [activity_type_service_1.ActivityTypeService])
], ActivityTypeController);
