# Socket.IO Events

## Authentication and Connection
The Socket server utilizes middleware to verify JWT tokens during the initial connection handshake.

## `connection` / `disconnect`
- **Direction:** Client -> Server -> Client
- **Description:** When a user connects, their status is updated to `online` in the DB, and a `userStatus` broadcast is fired off. When they disconnect, their status falls back to `offline`, followed by another broadcast.

## `joinRoom`
- **Direction:** Client -> Server
- **Payload Shape:** `roomId` (String)
- **Trigger:** A client opens a specific chat room UI and needs to subscribe to real-time events for that room.

## `sendMessage`
- **Direction:** Client -> Server
- **Payload Shape:** `{ "roomId": "room_id_string", "content": "message text" }`
- **Trigger:** A client submits a new message in a chat room. The server will save this to the DB and broadcast `newMessage` back to the room.

## `newMessage`
- **Direction:** Server -> Client
- **Payload Shape:** Message object `{ "sender": "user_id", "content": "message text", "room": "room_id", ... }`
- **Trigger:** The server receives a `sendMessage` event and successfully saves the message.

## `newRoom`
- **Direction:** Server -> Client
- **Payload Shape:** Room object (populated with members details)
- **Trigger:** Triggers when a new room is created via the `/rooms` POST endpoint. Emitted to the other member in the newly created room.

## `roomDeleted`
- **Direction:** Server -> Client
- **Payload Shape:** `{ "roomId": "deleted_room_id" }`
- **Trigger:** Emitted from the `/rooms/:roomId` DELETE endpoint to all members of the specified room when it is removed.

## `userStatus`
- **Direction:** Server -> Client
- **Payload Shape:** `{ "userId": "user_id_string", "status": "online" | "offline" }`
- **Trigger:** Fired continuously to online users whenever any client establishes or loses connection.
