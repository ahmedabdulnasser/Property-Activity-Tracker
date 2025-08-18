import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { ActivityService } from "./activity.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";

@ApiTags("Activities")
@ApiBearerAuth()
@Controller("activities")
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @UseGuards(JwtAuthGuard)
    @ApiOperation({
    summary: "Get all activities",
    description:
      "Returns activities all activities",
  })
  @ApiResponse({ status: 200, description: "Filtered activities returned." })
  @Get()
  async findAll() {
    return this.activityService.findAll();
  }

  @Get("filter")
  @ApiOperation({
    summary: "Filter activities",
    description:
      "Returns activities matching filter criteria (user name/email, type, time range).",
  })
  @ApiResponse({ status: 200, description: "Filtered activities returned." })
  async filterActivities(
    @Query("user") user?: string,
    @Query("type") type?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    return this.activityService.filterActivities({ user, type, from, to });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: "Create activity",
    description: "Creates a new activity. Requires authentication.",
  })
  @ApiBody({
    schema: {
      example: {
        type: "visit",
        propertyId: 1,
        salesRepId: 2,
        timestamp: "2025-08-18T12:00:00Z",
      },
    },
  })
  @ApiResponse({ status: 201, description: "Activity created." })
  async create(@Body() activityData: any, @Request() req) {
    // Add sales rep ID from authenticated user
    const userSalesRep = req.user?.salesRep || { id: activityData.salesRepId };
    const data = {
      ...activityData,
      salesRepId: userSalesRep.id,
    };
    return this.activityService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Get("missed-since/:timestamp")
  async getMissedActivities(@Param("timestamp") timestamp: string) {
    return this.activityService.findMissedActivitiesSince(timestamp);
  }

  @UseGuards(JwtAuthGuard)
  @Get("replay")
  async getActivitiesForReplay(
    @Query("from") from: string,
    @Query("to") to: string
  ) {
    return this.activityService.findActivitiesForReplay(from, to);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.activityService.findById(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateData: any) {
    return this.activityService.update(id, updateData);
  }
  @UseGuards(JwtAuthGuard)
  @Delete("delete-all")
  async deleteAll() {
    await this.activityService.deleteAll();
    return { message: "All activities and scores deleted." };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: number) {
    return this.activityService.delete(id);
  }
}
