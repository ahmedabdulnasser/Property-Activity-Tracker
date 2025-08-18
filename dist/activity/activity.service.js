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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const activity_entity_1 = require("../entities/activity.entity");
const sales_rep_service_1 = require("../sales-rep/sales-rep.service");
const event_emitter_1 = require("@nestjs/event-emitter");
let ActivityService = class ActivityService {
    constructor(activityRepository, salesRepService, eventEmitter) {
        this.activityRepository = activityRepository;
        this.salesRepService = salesRepService;
        this.eventEmitter = eventEmitter;
    }
    async filterActivities({ user, type, from, to, }) {
        const qb = this.activityRepository
            .createQueryBuilder("activity")
            .leftJoinAndSelect("activity.salesRep", "salesRep")
            .leftJoinAndSelect("salesRep.user", "user")
            .leftJoinAndSelect("activity.property", "property")
            .leftJoinAndSelect("activity.activityType", "activityType");
        if (user) {
            qb.andWhere("(LOWER(user.name) LIKE :user OR LOWER(user.email) LIKE :user)", { user: `%${user.toLowerCase()}%` });
        }
        if (type) {
            qb.andWhere("LOWER(activityType.name) = :type", {
                type: type.toLowerCase(),
            });
        }
        if (from) {
            qb.andWhere("activity.timestamp >= :from", { from });
        }
        if (to) {
            qb.andWhere("activity.timestamp <= :to", { to });
        }
        qb.orderBy("activity.timestamp", "DESC");
        return qb.getMany();
    }
    async create(activityData) {
        const activity = this.activityRepository.create(activityData);
        const savedActivity = await this.activityRepository.save(activity);
        const fullActivity = await this.findById(savedActivity.id);
        if (fullActivity.activityType && fullActivity.salesRepId) {
            await this.salesRepService.updateScore(fullActivity.salesRepId, fullActivity.activityType.weight);
        }
        this.eventEmitter.emit("activity.created", fullActivity);
        return fullActivity;
    }
    async findAll() {
        return this.activityRepository.find({
            relations: ["salesRep", "salesRep.user", "property", "activityType"],
            order: { timestamp: "DESC" },
        });
    }
    async findById(id) {
        const activity = await this.activityRepository.findOne({
            where: { id },
            relations: ["salesRep", "salesRep.user", "property", "activityType"],
        });
        if (!activity) {
            throw new common_1.NotFoundException(`Activity with ID ${id} not found`);
        }
        return activity;
    }
    async findRecentActivities(minutes = 60) {
        const since = new Date(Date.now() - minutes * 60 * 1000);
        return this.activityRepository.find({
            where: { timestamp: (0, typeorm_2.MoreThan)(since) },
            relations: ["salesRep", "salesRep.user", "property", "activityType"],
            order: { timestamp: "DESC" },
        });
    }
    async findMissedActivitiesSince(timestamp) {
        const since = new Date(timestamp);
        return this.activityRepository.find({
            where: { timestamp: (0, typeorm_2.MoreThan)(since) },
            relations: ["salesRep", "salesRep.user", "property", "activityType"],
            order: { timestamp: "DESC" },
        });
    }
    async findActivitiesForReplay(from, to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return this.activityRepository
            .createQueryBuilder("activity")
            .leftJoinAndSelect("activity.salesRep", "salesRep")
            .leftJoinAndSelect("salesRep.user", "user")
            .leftJoinAndSelect("activity.property", "property")
            .leftJoinAndSelect("activity.activityType", "activityType")
            .where("activity.timestamp BETWEEN :from AND :to", {
            from: fromDate,
            to: toDate,
        })
            .orderBy("activity.timestamp", "ASC")
            .getMany();
    }
    async update(id, updateData) {
        await this.activityRepository.update(id, updateData);
        return this.findById(id);
    }
    async delete(id) {
        if (!id || isNaN(id)) {
            throw new common_1.NotFoundException("Invalid activity ID");
        }
        const result = await this.activityRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Activity with ID ${id} not found`);
        }
    }
    async deleteAll() {
        await this.activityRepository.deleteAll();
        await this.salesRepService.resetAllScores();
    }
    async getHeatmapPoints({ from, to, type, }) {
        const query = {};
        if (from)
            query.timestamp = { $gte: new Date(from) };
        if (to) {
            query.timestamp = query.timestamp || {};
            query.timestamp.$lte = new Date(to);
        }
        if (type)
            query.activityType = type;
        const qb = this.activityRepository
            .createQueryBuilder("activity")
            .leftJoinAndSelect("activity.property", "property");
        if (from)
            qb.andWhere("activity.timestamp >= :from", { from });
        if (to)
            qb.andWhere("activity.timestamp <= :to", { to });
        if (type)
            qb.andWhere("activity.activityType = :type", { type });
        const activities = await qb.getMany();
        return activities
            .filter((a) => a.property && a.property.latitude && a.property.longitude)
            .map((a) => ({
            lat: a.property.latitude,
            lng: a.property.longitude,
            weight: 1,
        }));
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(activity_entity_1.Activity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        sales_rep_service_1.SalesRepService,
        event_emitter_1.EventEmitter2])
], ActivityService);
