import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { ActivityService } from "./activity.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("Activity Heatmap")
@ApiBearerAuth()
@Controller("activities-heatmap")
@UseGuards(JwtAuthGuard)
export class ActivityHeatmapController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: "Get activity heatmap", description: "Returns heatmap points for activities." })
  @ApiQuery({ name: "from", required: false, type: String })
  @ApiQuery({ name: "to", required: false, type: String })
  @ApiQuery({ name: "type", required: false, type: String })
  @ApiResponse({ status: 200, description: "Heatmap points returned." })
  async getHeatmap(
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("type") type?: string
  ) {
    // Returns array of { lat, lng, weight }
    return this.activityService.getHeatmapPoints({ from, to, type });
  }
}
