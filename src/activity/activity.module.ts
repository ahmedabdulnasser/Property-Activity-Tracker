import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Activity } from "../entities/activity.entity";
import { ActivityService } from "./activity.service";
import { ActivityController } from "./activity.controller";
import { SalesRepModule } from "../sales-rep/sales-rep.module";
import { ActivityHeatmapController } from "./activity-heatmap.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Activity]), SalesRepModule],
  providers: [ActivityService],
  controllers: [ActivityController, ActivityHeatmapController],
  exports: [ActivityService],
})
export class ActivityModule {}
