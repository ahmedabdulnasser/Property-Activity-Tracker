"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const sales_rep_module_1 = require("./sales-rep/sales-rep.module");
const property_module_1 = require("./property/property.module");
const activity_type_module_1 = require("./activity-type/activity-type.module");
const activity_module_1 = require("./activity/activity.module");
const websocket_module_1 = require("./websocket/websocket.module");
const notifications_module_1 = require("./notifications/notifications.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: "postgres",
                host: process.env.DB_HOST || "localhost",
                port: parseInt(process.env.DB_PORT) || 5432,
                username: process.env.DB_USERNAME || "postgres",
                password: process.env.DB_PASSWORD || "1234",
                database: process.env.DB_NAME || "pat_db",
                entities: [__dirname + "/**/*.entity{.ts,.js}"],
                synchronize: true,
                logging: true,
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            sales_rep_module_1.SalesRepModule,
            property_module_1.PropertyModule,
            activity_type_module_1.ActivityTypeModule,
            activity_module_1.ActivityModule,
            websocket_module_1.WebsocketModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
