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
exports.ActivityTypeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_type_entity_1 = require("../../entities/activity-type.entity");
let ActivityTypeService = class ActivityTypeService {
    constructor(activityTypeRepository) {
        this.activityTypeRepository = activityTypeRepository;
    }
    async create(activityTypeData) {
        const activityType = this.activityTypeRepository.create(activityTypeData);
        return this.activityTypeRepository.save(activityType);
    }
    async findAll() {
        return this.activityTypeRepository.find({
            order: { weight: "DESC" },
        });
    }
    async findById(id) {
        const activityType = await this.activityTypeRepository.findOne({
            where: { id },
        });
        if (!activityType) {
            throw new common_1.NotFoundException(`ActivityType with ID ${id} not found`);
        }
        return activityType;
    }
    async update(id, updateData) {
        await this.activityTypeRepository.update(id, updateData);
        return this.findById(id);
    }
    async delete(id) {
        const result = await this.activityTypeRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`ActivityType with ID ${id} not found`);
        }
    }
    async seedActivityTypes() {
        const sampleActivityTypes = [
            {
                name: "Visit",
                description: "In-person property visit",
                weight: 10,
            },
            {
                name: "Call",
                description: "Phone call with client",
                weight: 8,
            },
            {
                name: "Inspection",
                description: "Property inspection",
                weight: 6,
            },
            {
                name: "Follow-up",
                description: "Follow-up communication",
                weight: 4,
            },
            {
                name: "Note",
                description: "General note or update",
                weight: 2,
            },
        ];
        const activityTypes = [];
        for (const activityTypeData of sampleActivityTypes) {
            try {
                const existing = await this.activityTypeRepository.findOne({
                    where: { name: activityTypeData.name },
                });
                if (!existing) {
                    const activityType = await this.create(activityTypeData);
                    activityTypes.push(activityType);
                }
            }
            catch (error) {
            }
        }
        return activityTypes;
    }
};
exports.ActivityTypeService = ActivityTypeService;
exports.ActivityTypeService = ActivityTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_type_entity_1.ActivityType)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ActivityTypeService);
