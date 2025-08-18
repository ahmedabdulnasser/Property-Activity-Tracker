import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { SalesRepModule } from "./sales-rep/sales-rep.module";
import { PropertyModule } from "./property/property.module";
import { ActivityTypeModule } from "./activity-type/activity-type.module";
import { ActivityModule } from "./activity/activity.module";
import { WebsocketModule } from "./websocket/websocket.module";
import { NotificationsModule } from "./notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "1234",
      database: process.env.DB_NAME || "pat_db",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: true, // Only for development
      logging: true,
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    SalesRepModule,
    PropertyModule,
    ActivityTypeModule,
    ActivityModule,
    WebsocketModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
