
> NOTE:  this is not written by me it's written by some AI tools, it's a mix of both of them,
> for the record I am too tired after all of this load of work to write a proper readme,
> so thanks good these kinda creatures for helping me out
> it's a shame that I can't write a proper readme for this project
> I love writing readmes but I'm too tired to do it right now
> Enjoy the readme, it's a good one I hope.

# Full Stack Engineer Trial Task

Welcome to your Trial Task.🌴 We’re excited to see your skills and how you submit work. As you work through the questions, please ensure you save your responses locally to ensure no data is lost. Good luck\!

-----

## QUESTION 1: Build a Lightweight Access Manager

### Overview

Imagine we’re launching an internal tool to manage API access tokens across multiple services. Could you build a simple “Access Manager” UI and backend?

### Your Task

  * **Frontend**: A table showing access tokens per service (Service Name, Token, Expiry Date, Status).
  * Add filters: by Service or Expiry (e.g. expired tokens only).
  * **Backend**: Serve mock data via a `/api/tokens` endpoint.
  * **Bonus**: “Renew Token” button (no need for real logic - just UI + stub handler).

### My Solution: Architecture & Implementation

Here is a detailed breakdown of the implementation for the Lightweight Access Manager, covering both the frontend and backend components.

### Backend Implementation

The backend is built using **NestJS**, a progressive Node.js framework ideal for creating efficient and scalable server-side applications. It exposes a RESTful API to manage access tokens.

#### API Endpoints

The core of the backend is the `/api/tokens` endpoint, which provides the following functionalities:

  * **`GET /api/tokens`**: Retrieves a list of all access tokens. This endpoint is used by the frontend to populate the main data table.
  * **`GET /api/tokens/:id`**: Fetches a single access token by its unique ID.
  * **`POST /api/tokens`**: Creates a new access token. The service automatically generates a secure token and sets a default expiry date.
  * **`PATCH /api/tokens/:id`**: Updates the details of an existing access token, such as its status.
  * **`DELETE /api/tokens/:id`**: Deletes an access token from the system.
  * **`PATCH /api/tokens/:id/renew`**: Renews an access token, generating a new token string and extending its expiry date.

#### `AccessTokensService`

The business logic for managing access tokens is encapsulated in the `AccessTokensService`, as detailed in `apps/acme-server/src/access-tokens/access-tokens.service.ts`. This service is responsible for all interactions with the data source.

  * **`getAll()`**: This method queries the database for all access tokens and returns them. If no tokens are found, it throws a 404 Not Found error.
  * **`getOne(id)`**: Fetches a single token based on the provided `id`. If the token doesn't exist, it returns a 404 error.
  * **`create(data)`**: When creating a new token, this method:
    1.  Generates a 64-character hexadecimal token using `randomBytes` from the Node.js `crypto` module.
    2.  Sets a default expiry date of 7 days from the creation time.
    3.  Inserts the new token data into the database and returns the created record.
  * **`update(id, dto)`**: Updates a token with the new data provided in the `dto` (Data Transfer Object) and returns the updated record.
  * **`delete(id)`**: Removes a token from the database.
  * **`renew(id)`**: To renew a token, this method generates a new token string and sets a new 7-day expiry date, then updates the existing token in the database.

#### Data Model and Database

The backend uses **Drizzle ORM** to interact with a PostgreSQL database, as indicated by the use of `drizzle-orm/node-postgres`. Drizzle provides a type-safe SQL-like syntax for database queries. The `accessTokens` schema includes columns for `id`, `user_id`, `token`, `expires_at`, and `status`.

-----

### Frontend Implementation

The frontend is a **React** application, likely built with **Next.js** given the project structure, providing a user-friendly interface for managing the access tokens.

#### Main Components

  * **`AccessTokensTable`**: This is the central component of the UI. It displays the list of access tokens in a table with columns for "Service Name," "Token," "Expiry Date," and "Status." The table would also feature sorting capabilities.
  * **`Filters`**: A dedicated component that houses the filtering controls:
      * A dropdown menu to filter tokens by **Service Name**.
      * A set of radio buttons or a select menu to filter by **Status** (e.g., "All," "Active," "Expired").
  * **`RenewTokenButton`**: A button component placed in each row of the table. It triggers the token renewal process.

#### State Management

The application would leverage a modern data-fetching library like **React Query** for managing server state. This simplifies data fetching, caching, and synchronization with the backend API.

  * **`useGetTokens`**: A custom hook that fetches the list of all access tokens from the `/api/tokens` endpoint using React Query's `useQuery`. It automatically handles loading and error states, providing a seamless experience.
  * **`useRenewToken`**: Another custom hook that uses React Query's `useMutation` to handle the token renewal. When the "Renew Token" button is clicked, this mutation sends a `PATCH` request to the `/api/tokens/:id/renew` endpoint. Upon a successful response, it automatically invalidates the `useGetTokens` query, triggering a refetch of the token list to display the updated information in the table.

#### Data Flow

1.  When the `AccessTokensTable` component mounts, the `useGetTokens` hook is called, which initiates a `GET` request to the backend.
2.  The backend's `AccessTokensService` retrieves the token data from the database and returns it.
3.  The frontend then renders the data in the table.
4.  When a user applies a filter, the component's state is updated, and the displayed data is filtered on the client side. For larger datasets, this could be optimized to refetch filtered data from the server.
5.  Clicking the "Renew Token" button triggers the `useRenewToken` mutation, which updates the token on the backend and then automatically refreshes the data in the UI.

-----

## QUESTION 2: Sketch Token Expiry Automation

### Overview

We’re now exploring a feature that auto-emails engineers when their access token is due to expire within 3 days, unless it was already renewed.

### Your Task

  * Trigger this automation
  * Store/track token states (expiry, renewed)
  * Prevent repeat alerts or message spam
  * **Bonus**: flag any edge cases you’d plan for

### My Solution: Automation Design

Here is a detailed plan for implementing the token expiry automation feature.

#### 1\. Triggering the Automation

A **cron job** is the ideal solution for triggering a daily check for expiring tokens. A scheduled task will run once a day (e.g., at midnight UTC) to scan the `access_tokens` table in the database.

**Pseudocode for the Cron Job:**

```typescript
// In a dedicated scheduling service within the NestJS backend

import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AccessTokensService } from '../access-tokens/access-tokens.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class TokenExpiryNotifier {
  constructor(
    private readonly accessTokensService: AccessTokensService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    // Get all tokens that will expire in the next 3 days
    const expiringTokens = await this.accessTokensService.findTokensExpiringSoon(3);

    for (const token of expiringTokens) {
      // Check if a notification has not already been sent
      if (!token.notificationSentAt) {
        // Send the expiry notification email
        await this.emailService.sendTokenExpiryEmail({
          tokenName: token.name,
          expiresAt: token.expiresAt.toISOString(),
        });

        // Mark the token as having had a notification sent
        await this.accessTokensService.markNotificationAsSent(token.id);
      }
    }
  }
}
```

#### 2\. Storing and Tracking Token States

To effectively manage notifications, the `access_tokens` table schema should be enhanced:

  * **`expires_at` (timestamp)**: This existing field is crucial for identifying which tokens are about to expire.
  * **`status` (enum: 'active', 'expired', 'revoked')**: This allows us to filter for only active tokens that need notifications.
  * **`notification_sent_at` (timestamp, nullable)**: A new field to track when the last expiry notification was sent. This is more robust than a simple boolean flag, as it can be used for more complex logic in the future (e.g., sending multiple reminders).

When a token is renewed using the `renew()` method, the logic should be updated to set `notification_sent_at` back to `NULL`, making the token eligible for future expiry notifications.

#### 3\. Preventing Repeat Alerts

The `notification_sent_at` field is the key to preventing duplicate notifications and message spam. The cron job will only select tokens where `notification_sent_at` is `NULL`.

  * **Initial Notification**: The cron job queries for active tokens expiring within 3 days where `notification_sent_at` is `NULL`.
  * **Sending the Email**: For each of these tokens, it sends an email using a service that renders the `TokenExpiryEmail` React component, as defined in `apps/acme-server/src/email/emails/expiring-token.tsx`.
  * **Updating the State**: After successfully sending the email, the cron job updates the token's `notification_sent_at` field with the current timestamp.

This ensures that a notification is sent only once for each expiry period.

#### 4\. Bonus: Edge Cases to Plan For

  * **User is Away/Inactive**: If an engineer is on vacation, they might miss the notification. A follow-up reminder could be sent 24 hours before expiry if the token hasn't been renewed.
  * **Email Delivery Failures**: The email sending service should have a robust retry mechanism. If an email fails to send after several retries, the failure should be logged, and the `notification_sent_at` field should only be updated on successful delivery.
  * **Time Zone Differences**: The cron job should run at a consistent time (e.g., UTC). The expiry date in the email should be displayed in the user's local time zone or a standard format. The `toLocaleString()` method in the `TokenExpiryEmail` component already helps with this.
  * **Deactivated Users**: The system should not send notifications to users whose accounts are deactivated. The query for expiring tokens should ensure that only active users are notified.
  * **Database Performance**: If the system manages a very large number of tokens, the daily database query could become a performance bottleneck. The `expires_at` column should be indexed to ensure that the query for expiring tokens remains efficient.
