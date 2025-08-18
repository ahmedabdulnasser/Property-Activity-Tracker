import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from "@nestjs/swagger";
import { SalesRepService } from "./sales-rep.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("Sales Reps")
@ApiBearerAuth()
@Controller("sales-reps")
export class SalesRepController {
  constructor(private readonly salesRepService: SalesRepService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create sales rep", description: "Creates a new sales rep." })
  @ApiBody({ schema: { example: { name: "John Doe", email: "john@example.com" } } })
  @ApiResponse({ status: 201, description: "Sales rep created." })
  async create(@Body() salesRepData: any) {
    return this.salesRepService.create(salesRepData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.salesRepService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get("leaderboard")
  async getLeaderboard(@Query("limit") limit?: number) {
    return this.salesRepService.getLeaderboard(limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.salesRepService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("user/:userId")
  async findByUserId(@Param("userId") userId: number) {
    return this.salesRepService.findByUserId(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateData: any) {
    return this.salesRepService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/score")
  async updateScore(
    @Param("id") id: number,
    @Body() { points }: { points: number }
  ) {
    return this.salesRepService.updateScore(id, points);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/reset-score")
  async resetScore(@Param("id") id: number) {
    return this.salesRepService.resetScore(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: number) {
    return this.salesRepService.delete(id);
  }
}
