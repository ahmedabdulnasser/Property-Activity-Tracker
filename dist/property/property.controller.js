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
exports.PropertyController = void 0;
const common_1 = require("@nestjs/common");
const property_service_1 = require("./property.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let PropertyController = class PropertyController {
    constructor(propertyService) {
        this.propertyService = propertyService;
    }
    async create(propertyData) {
        return this.propertyService.create(propertyData);
    }
    async findAll() {
        return this.propertyService.findAll();
    }
    async findNearby(latitude, longitude, radius) {
        return this.propertyService.findNearby(latitude, longitude, radius);
    }
    async findOne(id) {
        return this.propertyService.findById(id);
    }
    async update(id, updateData) {
        return this.propertyService.update(id, updateData);
    }
    async delete(id) {
        return this.propertyService.delete(id);
    }
    async seedProperties() {
        return this.propertyService.seedProperties();
    }
};
exports.PropertyController = PropertyController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: "Create property", description: "Creates a new property." }),
    (0, swagger_1.ApiBody)({ schema: { example: { address: "123 Main St", city: "Metropolis", price: 500000 } } }),
    (0, swagger_1.ApiResponse)({ status: 201, description: "Property created." }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)("nearby"),
    __param(0, (0, common_1.Query)("latitude")),
    __param(1, (0, common_1.Query)("longitude")),
    __param(2, (0, common_1.Query)("radius")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "findNearby", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)("seed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PropertyController.prototype, "seedProperties", null);
exports.PropertyController = PropertyController = __decorate([
    (0, swagger_1.ApiTags)("Properties"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)("properties"),
    __metadata("design:paramtypes", [property_service_1.PropertyService])
], PropertyController);
