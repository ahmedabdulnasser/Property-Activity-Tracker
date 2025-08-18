import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SalesRep } from "../entities/sales-rep.entity";

@Injectable()
export class SalesRepService {
  constructor(
    @InjectRepository(SalesRep)
    private readonly salesRepRepository: Repository<SalesRep>
  ) {}

  async create(salesRepData: Partial<SalesRep>): Promise<SalesRep> {
    const salesRep = this.salesRepRepository.create(salesRepData);
    return this.salesRepRepository.save(salesRep);
  }

  async findAll(): Promise<SalesRep[]> {
    return this.salesRepRepository.find({ relations: ["user"] });
  }

  async findById(id: number): Promise<SalesRep> {
    const salesRep = await this.salesRepRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!salesRep) {
      throw new NotFoundException(`SalesRep with ID ${id} not found`);
    }
    return salesRep;
  }

  async findByUserId(userId: number): Promise<SalesRep> {
    const salesRep = await this.salesRepRepository.findOne({
      where: { userId },
      relations: ["user"],
    });
    if (!salesRep) {
      throw new NotFoundException(`SalesRep for user ID ${userId} not found`);
    }
    return salesRep;
  }

  async update(id: number, updateData: Partial<SalesRep>): Promise<SalesRep> {
    await this.salesRepRepository.update(id, updateData);
    return this.findById(id);
  }

  async updateScore(id: number, points: number): Promise<SalesRep> {
    const salesRep = await this.findById(id);
    salesRep.score += points;
    return this.salesRepRepository.save(salesRep);
  }

  async resetScore(id: number): Promise<SalesRep> {
    await this.salesRepRepository.update(id, { score: 0 });
    return this.findById(id);
  }

  async resetAllScores(): Promise<void> {
    await this.salesRepRepository
      .createQueryBuilder()
      .update(SalesRep)
      .set({ score: 0 })
      .execute();
  }

  async delete(id: number): Promise<void> {
    const result = await this.salesRepRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`SalesRep with ID ${id} not found`);
    }
  }

  async getLeaderboard(limit: number = 10): Promise<SalesRep[]> {
    return this.salesRepRepository.find({
      relations: ["user"],
      order: { score: "DESC" },
      take: limit,
    });
  }
}
