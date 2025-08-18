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
exports.PropertyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const property_entity_1 = require("../entities/property.entity");
let PropertyService = class PropertyService {
    constructor(propertyRepository) {
        this.propertyRepository = propertyRepository;
    }
    async create(propertyData) {
        const property = this.propertyRepository.create(propertyData);
        return this.propertyRepository.save(property);
    }
    async findAll() {
        return this.propertyRepository.find({
            order: { propertyName: "ASC" },
        });
    }
    async findById(id) {
        const property = await this.propertyRepository.findOne({ where: { id } });
        if (!property) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
        return property;
    }
    async update(id, updateData) {
        await this.propertyRepository.update(id, updateData);
        return this.findById(id);
    }
    async delete(id) {
        const result = await this.propertyRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Property with ID ${id} not found`);
        }
    }
    async findNearby(latitude, longitude, radiusKm = 10) {
        const query = `
      SELECT *, 
        ( 6371 * acos( cos( radians(${latitude}) ) * cos( radians( latitude ) ) 
        * cos( radians( longitude ) - radians(${longitude}) ) + sin( radians(${latitude}) ) 
        * sin( radians( latitude ) ) ) ) AS distance 
      FROM property 
      HAVING distance < ${radiusKm} 
      ORDER BY distance
    `;
        return this.propertyRepository.query(query);
    }
    async seedProperties() {
        const sampleProperties = [
            {
                propertyName: "Sunset Villa",
                address: "1234 Sunset Blvd, Los Angeles, CA 90028",
                latitude: 34.0983,
                longitude: -118.3267,
            },
            {
                propertyName: "Downtown Loft",
                address: "567 Spring St, Los Angeles, CA 90013",
                latitude: 34.0522,
                longitude: -118.2437,
            },
            {
                propertyName: "Beverly Hills Mansion",
                address: "890 Beverly Dr, Beverly Hills, CA 90210",
                latitude: 34.0736,
                longitude: -118.4004,
            },
            {
                propertyName: "Venice Beach House",
                address: "321 Ocean Front Walk, Venice, CA 90291",
                latitude: 33.985,
                longitude: -118.4695,
            },
            {
                propertyName: "Hollywood Heights",
                address: "456 Hollywood Blvd, Hollywood, CA 90028",
                latitude: 34.1022,
                longitude: -118.34,
            },
        ];
        const properties = [];
        for (const propertyData of sampleProperties) {
            try {
                const existing = await this.propertyRepository.findOne({
                    where: { propertyName: propertyData.propertyName },
                });
                if (!existing) {
                    const property = await this.create(propertyData);
                    properties.push(property);
                }
            }
            catch (error) {
            }
        }
        return properties;
    }
};
exports.PropertyService = PropertyService;
exports.PropertyService = PropertyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(property_entity_1.Property)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PropertyService);
