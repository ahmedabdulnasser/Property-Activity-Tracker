import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ActivityGateway } from "./activity.gateway";
import { ActivityModule } from "../activity/activity.module";
import { UserModule } from "../user/user.module";
import { SalesRepModule } from "../sales-rep/sales-rep.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    ActivityModule,
    UserModule,
    SalesRepModule,
    NotificationsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "nWeave123s",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [ActivityGateway],
  exports: [ActivityGateway],
})
export class WebsocketModule {}
