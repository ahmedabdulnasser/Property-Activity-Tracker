import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ActivityType } from "../../entities/activity-type.entity";

@Injectable()
export class ActivityTypeService {
  constructor(
    @InjectRepository(ActivityType)
    private readonly activityTypeRepository: Repository<ActivityType>
  ) {}

  async create(activityTypeData: Partial<ActivityType>): Promise<ActivityType> {
    const activityType = this.activityTypeRepository.create(activityTypeData);
    return this.activityTypeRepository.save(activityType);
  }

  async findAll(): Promise<ActivityType[]> {
    return this.activityTypeRepository.find({
      order: { weight: "DESC" },
    });
  }

  async findById(id: number): Promise<ActivityType> {
    const activityType = await this.activityTypeRepository.findOne({
      where: { id },
    });
    if (!activityType) {
      throw new NotFoundException(`ActivityType with ID ${id} not found`);
    }
    return activityType;
  }

  async update(
    id: number,
    updateData: Partial<ActivityType>
  ): Promise<ActivityType> {
    await this.activityTypeRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.activityTypeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`ActivityType with ID ${id} not found`);
    }
  }

  async seedActivityTypes(): Promise<ActivityType[]> {
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
      } catch (error) {
        // ActivityType might already exist, continue
      }
    }

    return activityTypes;
  }
}
