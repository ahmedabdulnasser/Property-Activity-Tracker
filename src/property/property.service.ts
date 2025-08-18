import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Property } from "../entities/property.entity";

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>
  ) {}

  async create(propertyData: Partial<Property>): Promise<Property> {
    const property = this.propertyRepository.create(propertyData);
    return this.propertyRepository.save(property);
  }

  async findAll(): Promise<Property[]> {
    return this.propertyRepository.find({
      order: { propertyName: "ASC" },
    });
  }

  async findById(id: number): Promise<Property> {
    const property = await this.propertyRepository.findOne({ where: { id } });
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
    return property;
  }

  async update(id: number, updateData: Partial<Property>): Promise<Property> {
    await this.propertyRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.propertyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<Property[]> {
    // Simple distance calculation (not precise for large distances)
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

  async seedProperties(): Promise<Property[]> {
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
      } catch (error) {
        // Property might already exist, continue
      }
    }

    return properties;
  }
}
