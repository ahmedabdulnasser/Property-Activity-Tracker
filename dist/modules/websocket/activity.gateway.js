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
const jwt_1 = require("@nestjs/jwt");
const event_emitter_1 = require("@nestjs/event-emitter");
const activity_service_1 = require("../activity/activity.service");
const user_service_1 = require("../user/user.service");
const sales_rep_service_1 = require("../sales-rep/sales-rep.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ActivityGateway = ActivityGateway_1 = class ActivityGateway {
    constructor(activityService, userService, jwtService, salesRepService, notificationsService) {
        this.activityService = activityService;
        this.userService = userService;
        this.jwtService = jwtService;
        this.salesRepService = salesRepService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(ActivityGateway_1.name);
        this.connectedUsers = new Map();
        this.userDisconnectTimes = new Map();
        this.highScoreNotificationsSent = new Set();
    }
    async handleConnection(client) {
        try {
            this.logger.log(`Client attempting connection: ${client.id}`);
            const token = client.handshake.auth?.token;
            if (!token) {
                this.logger.error(`No JWT token provided for client: ${client.id}`);
                client.emit("error", { message: "Authentication required" });
                client.disconnect();
                return;
            }
            let payload;
            try {
                payload = this.jwtService.verify(token);
            }
            catch (error) {
                this.logger.error(`Invalid JWT token for client ${client.id}:`, error.message);
                client.emit("error", { message: "Invalid authentication token" });
                client.disconnect();
                return;
            }
            client.data.userId = payload.sub;
            client.data.user = payload;
            const user = await this.userService.findById(payload.sub);
            if (user && user.lastSeenAt) {
                setTimeout(async () => {
                    const missedActivities = await this.activityService.findMissedActivitiesSince(user.lastSeenAt.toISOString());
                    if (missedActivities.length > 0) {
                        client.emit("missed-activities-since-disconnect", {
                            activities: missedActivities,
                            count: missedActivities.length,
                            since: user.lastSeenAt,
                        });
                        this.logger.log(`Sent ${missedActivities.length} missed activities to user ${user.id} since lastSeenAt`);
                    }
                }, 1000);
            }
            this.logger.log(`Client authenticated and connected: ${client.id}, User ID: ${payload.sub}`);
            client.emit("connected", {
                message: "Connected to activity updates",
                userId: payload.sub,
            });
        }
        catch (error) {
            this.logger.error("Connection error:", error);
            client.emit("error", { message: "Connection failed" });
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        const userId = client.data.userId;
        if (userId) {
            this.userDisconnectTimes.set(userId, new Date().toISOString());
            this.logger.log(`Tracked disconnect time for user ${userId}`);
            this.userService.setOnlineStatus(userId, false);
        }
        for (const [userIdKey, userData] of this.connectedUsers.entries()) {
            if (userData.socketId === client.id) {
                this.connectedUsers.delete(userIdKey);
                break;
            }
        }
    }
    getLastDisconnectTime(userId) {
        return this.userDisconnectTimes.get(userId);
    }
    clearDisconnectTime(userId) {
        this.userDisconnectTimes.delete(userId);
    }
    async handleActivityCreated(activity) {
        try {
            this.logger.log(`Handling activity created event for activity ${activity.id}`);
            const completeActivity = await this.activityService.findById(activity.id);
            await this.broadcastNewActivity(completeActivity);
            const leaderboard = await this.salesRepService.getLeaderboard(10);
            await this.broadcastLeaderboardUpdate(leaderboard);
        }
        catch (error) {
            this.logger.error("Error handling activity created event:", error);
        }
    }
    async handleJoinUser(data, client) {
        try {
            const userId = data.userId || client.data.userId;
            if (!userId) {
                client.emit("error", { message: "User ID required" });
                return;
            }
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
    async handleGetMissedActivities(data, client) {
        try {
            const activities = await this.activityService.findMissedActivitiesSince(data.since);
            client.emit("missed-activities", activities);
            this.logger.log(`Sent ${activities.length} missed activities to client ${client.id}`);
        }
        catch (error) {
            this.logger.error("Error fetching missed activities:", error);
            client.emit("error", { message: "Failed to fetch missed activities" });
        }
    }
    async handleReplayActivities(data, client) {
        try {
            const activities = await this.activityService.findActivitiesForReplay(data.from, data.to);
            const speed = data.speed || 1000;
            this.logger.log(`Starting replay of ${activities.length} activities for client ${client.id}`);
            client.emit("replay-started", { totalActivities: activities.length });
            for (let i = 0; i < activities.length; i++) {
                setTimeout(() => {
                    client.emit("replay-activity", {
                        activity: activities[i],
                        index: i + 1,
                        total: activities.length,
                        isReplay: true,
                    });
                    if (i === activities.length - 1) {
                        client.emit("replay-finished", {
                            totalActivities: activities.length,
                        });
                        this.logger.log(`Replay finished for client ${client.id}`);
                    }
                }, i * speed);
            }
        }
        catch (error) {
            this.logger.error("Error during replay:", error);
            client.emit("error", { message: "Failed to replay activities" });
        }
    }
    async handleRequestMissedSinceDisconnect(data, client) {
        try {
            const userId = client.data.userId;
            const activities = await this.activityService.findMissedActivitiesSince(data.lastConnected);
            const relevantActivities = activities.filter((activity) => activity.salesRep?.user?.id !== userId);
            client.emit("missed-activities-since-disconnect", {
                activities: relevantActivities,
                count: relevantActivities.length,
                since: data.lastConnected,
            });
            this.logger.log(`Sent ${relevantActivities.length} missed activities since disconnect to user ${userId}`);
        }
        catch (error) {
            this.logger.error("Error fetching missed activities since disconnect:", error);
            client.emit("error", { message: "Failed to fetch missed activities" });
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
            const updatedSalesRep = await this.salesRepService.findById(activity.salesRepId);
            if (updatedSalesRep && updatedSalesRep.score >= 100) {
                if (!this.highScoreNotificationsSent.has(updatedSalesRep.user.id)) {
                    const notification = {
                        type: "high_score",
                        message: `${updatedSalesRep.user.name} reached ${updatedSalesRep.score} points!`,
                        userId: String(updatedSalesRep.user.id),
                        status: "unread",
                        timestamp: new Date(),
                    };
                    this.server.emit("notification", notification);
                    console.log("Saving notification:", notification);
                    const saved = await this.notificationsService.create(notification);
                    console.log("Saved notification:", saved);
                    this.highScoreNotificationsSent.add(updatedSalesRep.user.id);
                    this.logger.log(`High score notification sent for user ${updatedSalesRep.user.id} with ${updatedSalesRep.score} points`);
                }
            }
            if (activity.activityType &&
                (activity.activityType.name === "visit" ||
                    activity.activityType.name === "inspection")) {
                const notification = {
                    type: "opportunity",
                    message: `${activity.salesRep.user.name} had an opportunity! (${activity.activityType.name})`,
                    userId: String(activity.salesRep.user.id),
                    status: "unread",
                    timestamp: new Date(),
                };
                this.server.emit("notification", notification);
                console.log("Saving notification:", notification);
                const saved = await this.notificationsService.create(notification);
                console.log("Saved notification:", saved);
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
    (0, event_emitter_1.OnEvent)("activity.created"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityGateway.prototype, "handleActivityCreated", null);
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
__decorate([
    (0, websockets_1.SubscribeMessage)("get-missed-activities"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ActivityGateway.prototype, "handleGetMissedActivities", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("replay-activities"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ActivityGateway.prototype, "handleReplayActivities", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("request-missed-since-disconnect"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ActivityGateway.prototype, "handleRequestMissedSinceDisconnect", null);
exports.ActivityGateway = ActivityGateway = ActivityGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: [
                "http://localhost:5173",
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                process.env.CORS_ORIGIN,
            ].filter(Boolean),
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [activity_service_1.ActivityService,
        user_service_1.UserService,
        jwt_1.JwtService,
        sales_rep_service_1.SalesRepService,
        notifications_service_1.NotificationsService])
], ActivityGateway);
