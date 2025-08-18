import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification } from "./notification.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>
  ) {}

  async findAll(filter: { userId?: string; type?: string; status?: string }) {
    const where: any = {};
    if (filter.userId) where.userId = filter.userId;
    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    return this.notificationRepo.find({ where, order: { timestamp: "DESC" } });
  }

  async markAsRead(id: string) {
    await this.notificationRepo.update(id, { status: "read" });
    return this.notificationRepo.findOne({ where: { id } });
  }

  async remove(id: string) {
    await this.notificationRepo.delete(id);
    return { deleted: true };
  }

  async create(data: Partial<Notification>) {
    try {
      const notification = this.notificationRepo.create(data);
      return await this.notificationRepo.save(notification);
    } catch (error) {
      console.error("Error saving notification:", error, data);
      throw error;
    }
  }
}
