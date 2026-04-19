# Database Schemas (MongoDB)

## User Model
- **username**: `String` (Required) - The user's unique chosen handle.
- **password**: `String` (Required) - Bcrypt hashed string.
- **status**: `String` (Enum: `["online", "offline"]`, Default: `"offline"`) - Current activity state.
- **timestamps**: `createdAt` / `updatedAt`

## Room Model
- **name**: `String` (Required) - In a DM, typically represented as `<user1_id>-<user2_id>`.
- **members**: Array of `ObjectId` referencing `User` models.
- **password**: `String` (Optional) - For private group rooms (if expanded later).
- **lastSeen**: `Map` of `Date` items - Stores the timestamp of each user's last activity per room (key: User ID, value: Date).
- **timestamps**: `createdAt` / `updatedAt`

## Message Model
- **sender**: `ObjectId` reference to `User` model.
- **room**: `ObjectId` reference to `Room` model.
- **content**: `String` (Required) - The text context of the message payload.
- **timestamps**: `createdAt` / `updatedAt`
