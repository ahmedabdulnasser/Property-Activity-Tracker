"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityTypeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const activity_type_entity_1 = require("../../entities/activity-type.entity");
const activity_type_service_1 = require("./activity-type.service");
const activity_type_controller_1 = require("./activity-type.controller");
let ActivityTypeModule = class ActivityTypeModule {
};
exports.ActivityTypeModule = ActivityTypeModule;
exports.ActivityTypeModule = ActivityTypeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([activity_type_entity_1.ActivityType])],
        providers: [activity_type_service_1.ActivityTypeService],
        controllers: [activity_type_controller_1.ActivityTypeController],
        exports: [activity_type_service_1.ActivityTypeService],
    })
], ActivityTypeModule);
