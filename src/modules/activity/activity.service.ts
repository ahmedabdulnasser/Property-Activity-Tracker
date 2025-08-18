import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { Activity } from "../../entities/activity.entity";
import { SalesRepService } from "../sales-rep/sales-rep.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    private readonly salesRepService: SalesRepService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Filter activities by user name/email, type, and time range
   */
  async filterActivities({
    user,
    type,
    from,
    to,
  }: {
    user?: string;
    type?: string;
    from?: string;
    to?: string;
  }): Promise<Activity[]> {
    const qb = this.activityRepository
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.salesRep", "salesRep")
      .leftJoinAndSelect("salesRep.user", "user")
      .leftJoinAndSelect("activity.property", "property")
      .leftJoinAndSelect("activity.activityType", "activityType");

    if (user) {
      qb.andWhere(
        "(LOWER(user.name) LIKE :user OR LOWER(user.email) LIKE :user)",
        { user: `%${user.toLowerCase()}%` }
      );
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

  async create(activityData: Partial<Activity>): Promise<Activity> {
    const activity = this.activityRepository.create(activityData);
    const savedActivity = await this.activityRepository.save(activity);

    // Fetch full activity with relations
    const fullActivity = await this.findById(savedActivity.id);

    // Update sales rep score
    if (fullActivity.activityType && fullActivity.salesRepId) {
      await this.salesRepService.updateScore(
        fullActivity.salesRepId,
        fullActivity.activityType.weight
      );
    }

    // Emit event for WebSocket
    this.eventEmitter.emit("activity.created", fullActivity);

    return fullActivity;
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find({
      relations: ["salesRep", "salesRep.user", "property", "activityType"],
      order: { timestamp: "DESC" },
    });
  }

  async findById(id: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ["salesRep", "salesRep.user", "property", "activityType"],
    });
    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
    return activity;
  }

  async findRecentActivities(minutes: number = 60): Promise<Activity[]> {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    return this.activityRepository.find({
      where: { timestamp: MoreThan(since) },
      relations: ["salesRep", "salesRep.user", "property", "activityType"],
      order: { timestamp: "DESC" },
    });
  }

  async findMissedActivitiesSince(timestamp: string): Promise<Activity[]> {
    const since = new Date(timestamp);
    return this.activityRepository.find({
      where: { timestamp: MoreThan(since) },
      relations: ["salesRep", "salesRep.user", "property", "activityType"],
      order: { timestamp: "DESC" },
    });
  }

  async findActivitiesForReplay(from: string, to: string): Promise<Activity[]> {
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

  async update(id: number, updateData: Partial<Activity>): Promise<Activity> {
    await this.activityRepository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    if (!id || isNaN(id)) {
      throw new NotFoundException("Invalid activity ID");
    }
    const result = await this.activityRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }
  }

  async deleteAll(): Promise<void> {
    await this.activityRepository.deleteAll();
    await this.salesRepService.resetAllScores();
  }

  async getHeatmapPoints({
    from,
    to,
    type,
  }: {
    from?: string;
    to?: string;
    type?: string;
  }) {
    const query: any = {};
    if (from) query.timestamp = { $gte: new Date(from) };
    if (to) {
      query.timestamp = query.timestamp || {};
      query.timestamp.$lte = new Date(to);
    }
    if (type) query.activityType = type;

    const qb = this.activityRepository
      .createQueryBuilder("activity")
      .leftJoinAndSelect("activity.property", "property");
    if (from) qb.andWhere("activity.timestamp >= :from", { from });
    if (to) qb.andWhere("activity.timestamp <= :to", { to });
    if (type) qb.andWhere("activity.activityType = :type", { type });
    const activities = await qb.getMany();
    // Map to heatmap points
    return activities
      .filter((a) => a.property && a.property.latitude && a.property.longitude)
      .map((a) => ({
        lat: a.property.latitude,
        lng: a.property.longitude,
        weight: 1,
      }));
  }
}
