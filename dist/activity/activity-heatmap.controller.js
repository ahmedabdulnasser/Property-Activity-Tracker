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
exports.ActivityHeatmapController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_service_1 = require("./activity.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let ActivityHeatmapController = class ActivityHeatmapController {
    constructor(activityService) {
        this.activityService = activityService;
    }
    async getHeatmap(from, to, type) {
        return this.activityService.getHeatmapPoints({ from, to, type });
    }
};
exports.ActivityHeatmapController = ActivityHeatmapController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Get activity heatmap", description: "Returns heatmap points for activities." }),
    (0, swagger_1.ApiQuery)({ name: "from", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "to", required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: "type", required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: "Heatmap points returned." }),
    __param(0, (0, common_1.Query)("from")),
    __param(1, (0, common_1.Query)("to")),
    __param(2, (0, common_1.Query)("type")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityHeatmapController.prototype, "getHeatmap", null);
exports.ActivityHeatmapController = ActivityHeatmapController = __decorate([
    (0, swagger_1.ApiTags)("Activity Heatmap"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("activities-heatmap"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [activity_service_1.ActivityService])
], ActivityHeatmapController);
