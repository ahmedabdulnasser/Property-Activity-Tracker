"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const activity_gateway_1 = require("./activity.gateway");
const activity_module_1 = require("../activity/activity.module");
const user_module_1 = require("../user/user.module");
const sales_rep_module_1 = require("../sales-rep/sales-rep.module");
const notifications_module_1 = require("../notifications/notifications.module");
let WebsocketModule = class WebsocketModule {
};
exports.WebsocketModule = WebsocketModule;
exports.WebsocketModule = WebsocketModule = __decorate([
    (0, common_1.Module)({
        imports: [
            activity_module_1.ActivityModule,
            user_module_1.UserModule,
            sales_rep_module_1.SalesRepModule,
            notifications_module_1.NotificationsModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || "nWeave123s",
                signOptions: { expiresIn: "1h" },
            }),
        ],
        providers: [activity_gateway_1.ActivityGateway],
        exports: [activity_gateway_1.ActivityGateway],
    })
], WebsocketModule);
