import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { ActivityService } from "../activity/activity.service";
import { UserService } from "../user/user.service";

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
})
export class ActivityGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ActivityGateway.name);
  private connectedUsers = new Map<
    string,
    { socketId: string; userId: number }
  >();

  constructor(
    private readonly activityService: ActivityService,
    private readonly userService: UserService
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client connected: ${client.id}`);
      client.emit("connected", { message: "Connected to activity updates" });
    } catch (error) {
      this.logger.error("Connection error:", error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove user from connected users map
    for (const [userId, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === client.id) {
        this.connectedUsers.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage("join-user")
  async handleJoinUser(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket
  ) {
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
    } catch (error) {
      this.logger.error("Error joining user:", error);
      client.emit("error", { message: "Failed to join activity updates" });
    }
  }

  @SubscribeMessage("get-recent-activities")
  async handleGetRecentActivities(
    @MessageBody() data: { minutes?: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const minutes = data.minutes || 60;
      const activities = await this.activityService.findRecentActivities(
        minutes
      );
      client.emit("recent-activities", activities);
    } catch (error) {
      this.logger.error("Error fetching recent activities:", error);
      client.emit("error", { message: "Failed to fetch recent activities" });
    }
  }

  // Method to broadcast new activity to all connected clients
  async broadcastNewActivity(activity: any) {
    try {
      this.server.emit("new-activity", activity);
      this.logger.log(`Broadcasted new activity: ${activity.id}`);

      // Check if this activity triggers a notification
      await this.checkForNotifications(activity);
    } catch (error) {
      this.logger.error("Error broadcasting activity:", error);
    }
  }

  // Method to check and send notifications based on activity
  async checkForNotifications(activity: any) {
    try {
      // Check for high score achievement (100+ points)
      if (activity.salesRep && activity.salesRep.score >= 100) {
        const notification = {
          type: "high_score",
          message: `${activity.salesRep.user.firstName} ${activity.salesRep.user.lastName} reached ${activity.salesRep.score} points!`,
          userId: activity.salesRep.user.id,
          timestamp: new Date(),
        };
        this.server.emit("notification", notification);
        this.logger.log(
          `High score notification sent for user ${activity.salesRep.user.id}`
        );
      }

      // Check for high-impact activity (visit or inspection)
      if (
        activity.activityType &&
        (activity.activityType.name === "visit" ||
          activity.activityType.name === "inspection")
      ) {
        const notification = {
          type: "opportunity",
          message: `${activity.salesRep.user.firstName} ${activity.salesRep.user.lastName} had an opportunity! (${activity.activityType.name})`,
          userId: activity.salesRep.user.id,
          timestamp: new Date(),
          activity: activity,
        };
        this.server.emit("notification", notification);
        this.logger.log(
          `Opportunity notification sent for ${activity.activityType.name} activity`
        );
      }
    } catch (error) {
      this.logger.error("Error checking notifications:", error);
    }
  }

  // Method to send activity update to specific user
  async sendActivityToUser(userId: number, activity: any) {
    try {
      this.server.to(`user-${userId}`).emit("user-activity", activity);
      this.logger.log(`Sent activity to user ${userId}: ${activity.id}`);
    } catch (error) {
      this.logger.error("Error sending activity to user:", error);
    }
  }

  // Method to broadcast leaderboard updates
  async broadcastLeaderboardUpdate(leaderboard: any[]) {
    try {
      this.server.emit("leaderboard-update", leaderboard);
      this.logger.log("Broadcasted leaderboard update");
    } catch (error) {
      this.logger.error("Error broadcasting leaderboard:", error);
    }
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId.toString());
  }
}
