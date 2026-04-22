Context: Now that the Firebase services and hooks are implemented for Modules 9 and 10, we need to restore our testing and mocking infrastructure.

Please execute the following 2 phases:

Phase 1: Create Mock Services

Create src/services/mocks/messageService.ts. It must implement the MessageService interface but use local setTimeout and onSnapshot-style callbacks to simulate Firestore.

Create src/services/mocks/notificationService.ts. It should simulate real-time notification pushes using mock data intervals. 3. Ensure all mock data uses strings for IDs (e.g., "msg_123", "user_abc") to match the new Firestore schema.

Phase 2: Implement Unit Tests

1. Create src/services/api/**tests**/messageService.real.test.ts and src/services/mocks/**tests**/messageService.mock.test.ts. 2. Create src/services/api/**tests**/notificationService.real.test.ts and src/services/mocks/**tests**/notificationService.mock.test.ts.
2. Tests should verify:

Subscriptions successfully receive data updates.

- sendMessage and markAllAsRead correctly update the state. \* The unreadCount calculation logic in the notification service is accurate.

Use jest and ts-jest. For "Real" service tests, mock the Firebase SDK calls using jest.fn() so we don't hit the production database during testing.
