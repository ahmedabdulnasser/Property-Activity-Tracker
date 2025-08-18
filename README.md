# Property Activity Tracker Platform Server-Side

## Overview

This is the server-side backend for the Property Activity Tracker Platform. It provides RESTful APIs, real-time WebSocket updates, authentication, and data management for property listings, user accounts, activities, notifications, and analytics. The backend is engineered for scalability, maintainability, and modern best practices, serving as the core data and business logic layer for the full-stack application.

---

## Tech Stack

**Backend:**

- NestJS (TypeScript)
- TypeORM (PostgreSQL)
- JWT Authentication
- WebSocket (Socket.IO)
- csv-parse (for seeding)

---

## Folder Structure

```
server/
  src/
    app.module.ts
    main.ts
    config/
    database/
    entities/
    modules/
      activity/
      activity-type/
      auth/
      notifications/
      property/
      sales-rep/
      user/
      websocket/
    common/
    interfaces/
    utils/
```

---

## Entity Relationship Diagram (ERD)

```
[User] <--- [Activity] ---> [Property]
   |             |
[SalesRep]   [ActivityType]
   |
[Notification]
```

<img width="1584" height="638" alt="image" src="https://github.com/user-attachments/assets/c619e419-e9bd-4965-87dc-c062cc583d93" />


### User
- id: string (UUID)
- name: string
- email: string
- password: string (hashed)
- isOnline: boolean
- last_seen_at: Date


### SalesRep
- id: string (UUID)
- score: number (accumulated weighted score)
- userId: string (relation to User)

### Property
- id: string (UUID)
- propertyName: string
- address: string
- latitude: number
- longitude: number

### Activity
- id: string (UUID)
- salesRepId: string (relation to SalesRep)
- propertyId: string (relation to Property)
- activityTypeId: number (relation to activityType)
- timestamp: Date
- note: string (optional)


### ActivityType
- id: string (UUID)
- name: string
- weight: number
- description: string


### Notification
- id: string (UUID)
- message: string
- type: string (info, warning, etc.)
- status: string (read/unread)
- userId: string (relation to User)
- timestamp: Date


---

## Key API Endpoints

### Auth

- `POST /auth/login` — Login and receive JWT
- `POST /auth/register` — Register new user

### Properties

- `GET /properties` — List all properties
- `POST /properties` — Create property
- `DELETE /properties/:id` — Delete property
- `POST /properties/seed` — Seed properties

### Activities

- `GET /activity` — List activities
- `POST /activity` — Create activity
- `GET /activity/leaderboard` — Get leaderboard
- `GET /activity/replay?period=...` — Replay activities for a period

### Notifications

- `GET /notifications` — List notifications
- `PATCH /notifications/:id` — Mark as read
- `DELETE /notifications/:id` — Delete notification

### WebSocket

- Real-time updates for activities and notifications

---

## API Endpoints

### User

- `POST /users` — Create user
- `GET /users` — List users
- `GET /users/profile` — Get current user profile
- `GET /users/:id` — Get user by ID
- `PATCH /users/:id` — Update user
- `DELETE /users/:id` — Delete user

### Activity

- `GET /activity` — List activities
- `GET /activity/filter` — Filter activities
- `POST /activity` — Create activity
- `GET /activity/missed-since/:timestamp` — Get missed activities since timestamp
- `GET /activity/replay` — Replay activities
- `GET /activity/:id` — Get activity by ID
- `PATCH /activity/:id` — Update activity
- `DELETE /activity/delete-all` — Delete all activities
- `DELETE /activity/:id` — Delete activity

### Activity Heatmap

- `GET /activity-heatmap` — Get activity heatmap

### Sales Rep

- `POST /sales-rep` — Create sales rep
- `GET /sales-rep` — List sales reps
- `GET /sales-rep/leaderboard` — Get leaderboard
- `GET /sales-rep/:id` — Get sales rep by ID
- `GET /sales-rep/user/:userId` — Get sales rep by user ID
- `PATCH /sales-rep/:id` — Update sales rep
- `PATCH /sales-rep/:id/score` — Update sales rep score
- `PATCH /sales-rep/:id/reset-score` — Reset sales rep score
- `DELETE /sales-rep/:id` — Delete sales rep

### Auth

- `POST /auth/register` — Register user
- `POST /auth/login` — Login

### Property

- `POST /properties` — Create property
- `GET /properties` — List properties
- `GET /properties/nearby` — Find nearby properties
- `GET /properties/:id` — Get property by ID
- `PATCH /properties/:id` — Update property
- `DELETE /properties/delete-all` — Delete all properties
- `DELETE /properties/:id` — Delete property
- `POST /properties/seedfromcsv` — Seed properties from CSV
- `POST /properties/seed` — Seed properties

### Notifications

- `GET /notifications` — List notifications
- `PATCH /notifications/:id` — Mark notification as read
- `DELETE /notifications/:id` — Delete notification

### Activity Type

- `POST /activity-type` — Create activity type
- `GET /activity-type` — List activity types
- `GET /activity-type/:id` — Get activity type by ID
- `PATCH /activity-type/:id` — Update activity type
- `DELETE /activity-type/:id` — Delete activity type
- `POST /activity-type/seed` — Seed activity types

---

## How This Solves the Original Backend Challenge

- **Modular Architecture:** Each feature is isolated in its own module, making the codebase scalable and maintainable.
- **Full CRUD & Filtering:** All required entities (properties, users, activities, notifications, etc.) have full CRUD endpoints and advanced filtering.
- **Seeding & Bulk Operations:** Bulk deletion and seeding endpoints/scripts allow for easy data resets and imports, supporting rapid prototyping and testing.
- **Real-Time & Analytics:** WebSocket integration and endpoints for activity heatmaps, leaderboards, and replays provide real-time insights and analytics.
- **Security:** JWT authentication and guards protect sensitive endpoints.
- **Documentation:** The README and code comments provide clear guidance for onboarding and usage.

This backend is ready for production use, rapid iteration, and future expansion, fully addressing the requirements and pain points of the original challenge.

---

## Design Decisions: Database Normalization

The backend uses a normalized relational database design for all core entities (User, Property, SalesRep, Activity, Notification, etc.).

**Why normalization?**

- Reduces data redundancy (no repeated property or sales rep info)
- Ensures data integrity (updates and deletes are consistent)
- Prevents anomalies (insert, update, delete)
- Makes the schema scalable and maintainable

**What if we didn't normalize?**

- Data would be duplicated across tables/rows
- Updates could lead to inconsistent or stale data
- Deletes or inserts could cause loss or corruption of related data

**Cons of normalization:**

- More tables and relationships mean more complex queries (joins)
- Can impact read performance for analytics or reporting
- Over-normalization can make the schema harder to understand

**Summary:**
Normalization is ideal for transactional systems like nWeave, where data integrity and maintainability are critical. For reporting or analytics, selective denormalization may be considered for performance.

## Notification & Replay Logic

### Notifications
- Notifications are stored as entities with a message, type (info, warning, etc.), status (read/unread), and user association.
- The backend provides endpoints to list, mark as read, and delete notifications for each user.
- Notifications are generated for key events (e.g., new activity, missed activity, system alerts) and delivered in real-time via WebSocket for instant feedback.
- The design ensures users are always informed about important updates and can manage their notification status.

### Replay Logic
- The activity replay feature allows users and admins to view historical activities over a selected period (e.g., today, last week).
- Replay endpoints aggregate and return activities based on time filters, supporting analytics and review of past events.
- This logic is used for dashboards, heatmaps, and leaderboards, enabling insights into user/property engagement and performance.
- Replay is optimized for both API and real-time delivery, supporting both batch and live review scenarios.

## Development & Running

- **Backend:**
  ```
  npm install
  npm run start:dev
  ```
---

## Seeding Properties

1. Install dependencies:
   ```
   npm install csv-parse
   ```
2. Run the seed script:
   ```
   npx ts-node src/database/seed-properties.ts
   ```
   - Deletes all properties and seeds new ones from your CSV file.
   - Uses the first part of the address as the property name and supports latitude/longitude if present.

---
