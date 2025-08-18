import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from "@nestjs/swagger";
@ApiTags("Notifications")
@ApiBearerAuth()
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "Get notifications", description: "Returns notifications for a user." })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "type", required: false, type: String })
  @ApiQuery({ name: "status", required: false, type: String })
  @ApiResponse({ status: 200, description: "Notifications returned." })
  findAll(
    @Query("userId") userId?: string,
    @Query("type") type?: string,
    @Query("status") status?: string
  ) {
    return this.notificationsService.findAll({ userId, type, status });
  }

  @Patch(":id")
  markAsRead(@Param("id") id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.notificationsService.remove(id);
  }
}
