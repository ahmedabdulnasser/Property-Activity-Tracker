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
import { Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { OnEvent } from "@nestjs/event-emitter";
import { ActivityService } from "../activity/activity.service";
import { UserService } from "../user/user.service";
import { SalesRepService } from "../sales-rep/sales-rep.service";
import { NotificationsService } from "../notifications/notifications.service";

@WebSocketGateway({
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      process.env.CORS_ORIGIN,
    ].filter(Boolean),
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
  private userDisconnectTimes = new Map<number, string>(); // Track when users disconnect
  private highScoreNotificationsSent = new Set<number>(); // Track which users already got high score notifications

  constructor(
    private readonly activityService: ActivityService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly salesRepService: SalesRepService,
    private readonly notificationsService: NotificationsService
  ) {}

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting connection: ${client.id}`);

      // Extract JWT token from connection
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.error(`No JWT token provided for client: ${client.id}`);
        client.emit("error", { message: "Authentication required" });
        client.disconnect();
        return;
      }

      // Verify JWT token
      let payload;
      try {
        payload = this.jwtService.verify(token);
      } catch (error) {
        this.logger.error(
          `Invalid JWT token for client ${client.id}:`,
          error.message
        );
        client.emit("error", { message: "Invalid authentication token" });
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.data.userId = payload.sub;
      client.data.user = payload;

      // Fetch user from DB
      const user = await this.userService.findById(payload.sub);
      // Replay activities since lastSeenAt
      if (user && user.lastSeenAt) {
        setTimeout(async () => {
          const missedActivities =
            await this.activityService.findMissedActivitiesSince(
              user.lastSeenAt.toISOString()
            );
          if (missedActivities.length > 0) {
            client.emit("missed-activities-since-disconnect", {
              activities: missedActivities,
              count: missedActivities.length,
              since: user.lastSeenAt,
            });
            this.logger.log(
              `Sent ${missedActivities.length} missed activities to user ${user.id} since lastSeenAt`
            );
          }
        }, 1000); // Give client time to set up listeners
      }

      this.logger.log(
        `Client authenticated and connected: ${client.id}, User ID: ${payload.sub}`
      );
      client.emit("connected", {
        message: "Connected to activity updates",
        userId: payload.sub,
      });
    } catch (error) {
      this.logger.error("Connection error:", error);
      client.emit("error", { message: "Connection failed" });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Track disconnect time for replay functionality
    const userId = client.data.userId;
    if (userId) {
      this.userDisconnectTimes.set(userId, new Date().toISOString());
      this.logger.log(`Tracked disconnect time for user ${userId}`);
      // Persist lastSeenAt to user entity
      this.userService.setOnlineStatus(userId, false);
    }

    // Remove user from connected users map
    for (const [userIdKey, userData] of this.connectedUsers.entries()) {
      if (userData.socketId === client.id) {
        this.connectedUsers.delete(userIdKey);
        break;
      }
    }
  }

  // Helper methods for disconnect time tracking
  private getLastDisconnectTime(userId: number): string | undefined {
    return this.userDisconnectTimes.get(userId);
  }

  private clearDisconnectTime(userId: number): void {
    this.userDisconnectTimes.delete(userId);
  }

  // Event listener for activity creation
  @OnEvent("activity.created")
  async handleActivityCreated(activity: any) {
    try {
      this.logger.log(
        `Handling activity created event for activity ${activity.id}`
      );

      // Get the complete activity with updated sales rep score
      const completeActivity = await this.activityService.findById(activity.id);

      // Broadcast the new activity to all connected users
      await this.broadcastNewActivity(completeActivity);

      // Also broadcast updated leaderboard
      const leaderboard = await this.salesRepService.getLeaderboard(10);
      await this.broadcastLeaderboardUpdate(leaderboard);
    } catch (error) {
      this.logger.error("Error handling activity created event:", error);
    }
  }

  @SubscribeMessage("join-user")
  async handleJoinUser(
    @MessageBody() data: { userId?: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      // Use authenticated user ID or provided user ID (for testing)
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

  @SubscribeMessage("get-missed-activities")
  async handleGetMissedActivities(
    @MessageBody() data: { since: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const activities = await this.activityService.findMissedActivitiesSince(
        data.since
      );
      client.emit("missed-activities", activities);
      this.logger.log(
        `Sent ${activities.length} missed activities to client ${client.id}`
      );
    } catch (error) {
      this.logger.error("Error fetching missed activities:", error);
      client.emit("error", { message: "Failed to fetch missed activities" });
    }
  }

  @SubscribeMessage("replay-activities")
  async handleReplayActivities(
    @MessageBody() data: { from: string; to: string; speed?: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const activities = await this.activityService.findActivitiesForReplay(
        data.from,
        data.to
      );

      const speed = data.speed || 1000; // Default 1 second between activities

      this.logger.log(
        `Starting replay of ${activities.length} activities for client ${client.id}`
      );
      client.emit("replay-started", { totalActivities: activities.length });

      // Send activities one by one with delay to simulate real-time replay
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
    } catch (error) {
      this.logger.error("Error during replay:", error);
      client.emit("error", { message: "Failed to replay activities" });
    }
  }

  @SubscribeMessage("request-missed-since-disconnect")
  async handleRequestMissedSinceDisconnect(
    @MessageBody() data: { lastConnected: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const userId = client.data.userId;
      const activities = await this.activityService.findMissedActivitiesSince(
        data.lastConnected
      );

      // Filter activities that are relevant to this user or are global announcements
      const relevantActivities = activities.filter(
        (activity) => activity.salesRep?.user?.id !== userId // Don't show user's own activities
      );

      client.emit("missed-activities-since-disconnect", {
        activities: relevantActivities,
        count: relevantActivities.length,
        since: data.lastConnected,
      });

      this.logger.log(
        `Sent ${relevantActivities.length} missed activities since disconnect to user ${userId}`
      );
    } catch (error) {
      this.logger.error(
        "Error fetching missed activities since disconnect:",
        error
      );
      client.emit("error", { message: "Failed to fetch missed activities" });
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
      const updatedSalesRep = await this.salesRepService.findById(
        activity.salesRepId
      );
      // High score notification
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
          this.logger.log(
            `High score notification sent for user ${updatedSalesRep.user.id} with ${updatedSalesRep.score} points`
          );
        }
      }
      // Opportunity notification
      if (
        activity.activityType &&
        (activity.activityType.name === "visit" ||
          activity.activityType.name === "inspection")
      ) {
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
