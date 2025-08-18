import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { ActivityTypeService } from "./activity-type.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from "@nestjs/swagger";

@ApiTags("Activity Types")
@ApiBearerAuth()
@Controller("activity-types")
export class ActivityTypeController {
  constructor(private readonly activityTypeService: ActivityTypeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create activity type", description: "Creates a new activity type." })
  @ApiBody({ schema: { example: { name: "Visit", description: "Sales rep visit" } } })
  @ApiResponse({ status: 201, description: "Activity type created." })
  async create(@Body() activityTypeData: any) {
    return this.activityTypeService.create(activityTypeData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.activityTypeService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.activityTypeService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateData: any) {
    return this.activityTypeService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: number) {
    return this.activityTypeService.delete(id);
  }

  @Post("seed")
  async seedActivityTypes() {
    return this.activityTypeService.seedActivityTypes();
  }
}
