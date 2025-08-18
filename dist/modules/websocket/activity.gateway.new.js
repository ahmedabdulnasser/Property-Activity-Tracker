"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ActivityGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const activity_service_1 = require("../activity/activity.service");
const user_service_1 = require("../user/user.service");
let ActivityGateway = ActivityGateway_1 = class ActivityGateway {
    constructor(activityService, userService) {
        this.activityService = activityService;
        this.userService = userService;
        this.logger = new common_1.Logger(ActivityGateway_1.name);
        this.connectedUsers = new Map();
    }
    async handleConnection(client) {
        try {
            this.logger.log(`Client connected: ${client.id}`);
            client.emit("connected", { message: "Connected to activity updates" });
        }
        catch (error) {
            this.logger.error("Connection error:", error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [userId, userData] of this.connectedUsers.entries()) {
            if (userData.socketId === client.id) {
                this.connectedUsers.delete(userId);
                break;
            }
        }
    }
    async handleJoinUser(data, client) {
        try {
            const { userId } = data;
            this.connectedUsers.set(userId.toString(), {
                socketId: client.id,
                userId,
            });
            client.join(`user-${userId}`);
            this.logger.log(`User ${userId} joined activity updates`);
            client.emit("user-joined", {
                userId,
                message: "Joined activity updates",
            });
        }
        catch (error) {
            this.logger.error("Error joining user:", error);
            client.emit("error", { message: "Failed to join activity updates" });
        }
    }
    async handleGetRecentActivities(data, client) {
        try {
            const minutes = data.minutes || 60;
            const activities = await this.activityService.findRecentActivities(minutes);
            client.emit("recent-activities", activities);
        }
        catch (error) {
            this.logger.error("Error fetching recent activities:", error);
            client.emit("error", { message: "Failed to fetch recent activities" });
        }
    }
    async broadcastNewActivity(activity) {
        try {
            this.server.emit("new-activity", activity);
            this.logger.log(`Broadcasted new activity: ${activity.id}`);
            await this.checkForNotifications(activity);
        }
        catch (error) {
            this.logger.error("Error broadcasting activity:", error);
        }
    }
    async checkForNotifications(activity) {
        try {
            if (activity.salesRep && activity.salesRep.score >= 100) {
                const notification = {
                    type: "high_score",
                    message: `${activity.salesRep.user.firstName} ${activity.salesRep.user.lastName} reached ${activity.salesRep.score} points!`,
                    userId: activity.salesRep.user.id,
                    timestamp: new Date(),
                };
                this.server.emit("notification", notification);
                this.logger.log(`High score notification sent for user ${activity.salesRep.user.id}`);
            }
            if (activity.activityType &&
                (activity.activityType.name === "visit" ||
                    activity.activityType.name === "inspection")) {
                const notification = {
                    type: "opportunity",
                    message: `${activity.salesRep.user.firstName} ${activity.salesRep.user.lastName} had an opportunity! (${activity.activityType.name})`,
                    userId: activity.salesRep.user.id,
                    timestamp: new Date(),
                    activity: activity,
                };
                this.server.emit("notification", notification);
                this.logger.log(`Opportunity notification sent for ${activity.activityType.name} activity`);
            }
        }
        catch (error) {
            this.logger.error("Error checking notifications:", error);
        }
    }
    async sendActivityToUser(userId, activity) {
        try {
            this.server.to(`user-${userId}`).emit("user-activity", activity);
            this.logger.log(`Sent activity to user ${userId}: ${activity.id}`);
        }
        catch (error) {
            this.logger.error("Error sending activity to user:", error);
        }
    }
    async broadcastLeaderboardUpdate(leaderboard) {
        try {
            this.server.emit("leaderboard-update", leaderboard);
            this.logger.log("Broadcasted leaderboard update");
        }
        catch (error) {
            this.logger.error("Error broadcasting leaderboard:", error);
        }
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId.toString());
    }
};
exports.ActivityGateway = ActivityGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ActivityGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("join-user"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ActivityGateway.prototype, "handleJoinUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("get-recent-activities"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ActivityGateway.prototype, "handleGetRecentActivities", null);
exports.ActivityGateway = ActivityGateway = ActivityGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173",
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [activity_service_1.ActivityService,
        user_service_1.UserService])
], ActivityGateway);
