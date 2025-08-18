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
exports.ActivityController = void 0;
const common_1 = require("@nestjs/common");
const activity_service_1 = require("./activity.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ActivityController = class ActivityController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    async findAll() {
        return this.activityService.findAll();
    }
    async filterActivities(user, type, from, to) {
        return this.activityService.filterActivities({ user, type, from, to });
    }
    async create(activityData, req) {
        const userSalesRep = req.user?.salesRep || { id: activityData.salesRepId };
        const data = {
            ...activityData,
            salesRepId: userSalesRep.id,
        };
        return this.activityService.create(data);
    }
    async getMissedActivities(timestamp) {
        return this.activityService.findMissedActivitiesSince(timestamp);
    }
    async getActivitiesForReplay(from, to) {
        return this.activityService.findActivitiesForReplay(from, to);
    }
    async findOne(id) {
        return this.activityService.findById(Number(id));
    }
    async update(id, updateData) {
        return this.activityService.update(id, updateData);
    }
    async deleteAll() {
        await this.activityService.deleteAll();
        return { message: "All activities and scores deleted." };
    }
    async delete(id) {
        return this.activityService.delete(id);
    }
};
exports.ActivityController = ActivityController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Get all activities",
        description: "Returns activities all activities",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Filtered activities returned." }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("filter"),
    (0, swagger_1.ApiOperation)({
        summary: "Filter activities",
        description: "Returns activities matching filter criteria (user name/email, type, time range).",
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Filtered activities returned." }),
    __param(0, (0, common_1.Query)("user")),
    __param(1, (0, common_1.Query)("type")),
    __param(2, (0, common_1.Query)("from")),
    __param(3, (0, common_1.Query)("to")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "filterActivities", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: "Create activity",
        description: "Creates a new activity. Requires authentication.",
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                type: "visit",
                propertyId: 1,
                salesRepId: 2,
                timestamp: "2025-08-18T12:00:00Z",
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Activity created." }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("missed-since/:timestamp"),
    __param(0, (0, common_1.Param)("timestamp")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getMissedActivities", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("replay"),
    __param(0, (0, common_1.Query)("from")),
    __param(1, (0, common_1.Query)("to")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivitiesForReplay", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)("delete-all"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "deleteAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "delete", null);
exports.ActivityController = ActivityController = __decorate([
    (0, swagger_1.ApiTags)("Activities"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("activities"),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityController);
