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
exports.SalesRepService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_rep_entity_1 = require("../entities/sales-rep.entity");
let SalesRepService = class SalesRepService {
    constructor(salesRepRepository) {
        this.salesRepRepository = salesRepRepository;
    }
    async create(salesRepData) {
        const salesRep = this.salesRepRepository.create(salesRepData);
        return this.salesRepRepository.save(salesRep);
    }
    async findAll() {
        return this.salesRepRepository.find({ relations: ["user"] });
    }
    async findById(id) {
        const salesRep = await this.salesRepRepository.findOne({
            where: { id },
            relations: ["user"],
        });
        if (!salesRep) {
            throw new common_1.NotFoundException(`SalesRep with ID ${id} not found`);
        }
        return salesRep;
    }
    async findByUserId(userId) {
        const salesRep = await this.salesRepRepository.findOne({
            where: { userId },
            relations: ["user"],
        });
        if (!salesRep) {
            throw new common_1.NotFoundException(`SalesRep for user ID ${userId} not found`);
        }
        return salesRep;
    }
    async update(id, updateData) {
        await this.salesRepRepository.update(id, updateData);
        return this.findById(id);
    }
    async updateScore(id, points) {
        const salesRep = await this.findById(id);
        salesRep.score += points;
        return this.salesRepRepository.save(salesRep);
    }
    async resetScore(id) {
        await this.salesRepRepository.update(id, { score: 0 });
        return this.findById(id);
    }
    async resetAllScores() {
        await this.salesRepRepository
            .createQueryBuilder()
            .update(sales_rep_entity_1.SalesRep)
            .set({ score: 0 })
            .execute();
    }
    async delete(id) {
        const result = await this.salesRepRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`SalesRep with ID ${id} not found`);
        }
    }
    async getLeaderboard(limit = 10) {
        return this.salesRepRepository.find({
            relations: ["user"],
            order: { score: "DESC" },
            take: limit,
        });
    }
};
exports.SalesRepService = SalesRepService;
exports.SalesRepService = SalesRepService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_rep_entity_1.SalesRep)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SalesRepService);
