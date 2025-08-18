import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SalesRep } from "../../entities/sales-rep.entity";
import { SalesRepService } from "./sales-rep.service";
import { SalesRepController } from "./sales-rep.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SalesRep])],
  providers: [SalesRepService],
  controllers: [SalesRepController],
  exports: [SalesRepService],
})
export class SalesRepModule {}
