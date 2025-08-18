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
import { PropertyService } from "./property.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from "@nestjs/swagger";

@ApiTags("Properties")
@ApiBearerAuth()
@Controller("properties")
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: "Create property", description: "Creates a new property." })
  @ApiBody({ schema: { example: { address: "123 Main St", city: "Metropolis", price: 500000 } } })
  @ApiResponse({ status: 201, description: "Property created." })
  async create(@Body() propertyData: any) {
    return this.propertyService.create(propertyData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.propertyService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get("nearby")
  async findNearby(
    @Query("latitude") latitude: number,
    @Query("longitude") longitude: number,
    @Query("radius") radius?: number
  ) {
    return this.propertyService.findNearby(latitude, longitude, radius);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.propertyService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateData: any) {
    return this.propertyService.update(id, updateData);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: number) {
    return this.propertyService.delete(id);
  }

  @Post("seed")
  async seedProperties() {
    return this.propertyService.seedProperties();
  }
}
