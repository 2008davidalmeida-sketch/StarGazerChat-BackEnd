# REST API Documentation

## Authentication (`/auth`)

### Register
- **Method:** POST
- **Path:** `/auth/register`
- **Auth Required:** No
- **Request Body:** `{ "username": "user1", "password": "password123" }`
- **Response:** `{ "message": "User created successfully" }` or error message.

### Login
- **Method:** POST
- **Path:** `/auth/login`
- **Auth Required:** No
- **Request Body:** `{ "username": "user1", "password": "password123" }`
- **Response:** `{ "token": "jwt_token_here" }` or error message.

## Users (`/users`)

### Search Users
- **Method:** GET
- **Path:** `/users/search?q=query`
- **Auth Required:** Yes
- **Request Params:** `q` (Search query)
- **Response:** Array of user objects (excluding passwords) whose username matches the query.

### Get Current User
- **Method:** GET
- **Path:** `/users/me`
- **Auth Required:** Yes
- **Response:** User object of the currently authenticated user (excluding password).

### Update Profile
- **Method:** PATCH
- **Path:** `/users/me`
- **Auth Required:** Yes
- **Request Body:** `{ "username": "newUsername", "bio": "My new bio" }`
- **Response:** Updated user object on success, or `{ "message": "Username already taken" }` if the username conflicts with another account.

### Change Password
- **Method:** PATCH
- **Path:** `/users/password`
- **Auth Required:** Yes
- **Request Body:** `{ "currentPassword": "oldPass", "newPassword": "newPass" }`
- **Response:** `{ "message": "Password updated successfully" }` or `{ "message": "Current password is incorrect" }`.

## Rooms (`/rooms`)

### Get User Rooms
- **Method:** GET
- **Path:** `/rooms/`
- **Auth Required:** Yes
- **Response:** Array of room objects populated with `members`, `lastMessage`, `lastSeen`, and `unreadCount`.

### Create Room (Direct Message)
- **Method:** POST
- **Path:** `/rooms/`
- **Auth Required:** Yes
- **Request Body:** `{ "targetUsername": "username_to_chat_with" }`
- **Response:** The newly created or existing room populated with members data.

### Delete Room
- **Method:** DELETE
- **Path:** `/rooms/:roomId`
- **Auth Required:** Yes
- **Request Params:** `roomId` 
- **Response:** `{ "message": "Room deleted" }`

### Update Last Seen
- **Method:** PATCH
- **Path:** `/rooms/:roomId/lastSeen`
- **Auth Required:** Yes
- **Request Params:** `roomId`
- **Response:** `{ "message": "Last seen updated" }`

## Messages (`/messages`)

### Get Room Messages
- **Method:** GET
- **Path:** `/messages/:roomId`
- **Auth Required:** Yes
- **Request Params:** `roomId`
- **Response:** Array of message objects belonging to the specified room, sorted chronologically.
