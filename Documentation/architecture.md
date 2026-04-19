# Architecture Overview

This backend is built for real-time messaging using a Node.js/Express stack combined with Socket.IO for real-time bidirectional event-based communication.

## Tech Stack
- **Node.js & Express**: Core framework for RESTful API routing and middleware management.
- **MongoDB & Mongoose**: NoSQL database and Object Data Modeling (ODM) library.
- **Socket.IO**: Real-time engine.
- **bcrypt & jsonwebtoken**: Used for secure password hashing and stateless JWT-based authentication.

## Folder Structure
- `middleware/`: Contains Express middleware like `authMiddleware`.
- `models/`: Mongoose schemas defining database entities (`User`, `Room`, `Message`).
- `routes/`: API route definitions (`auth.js`, `users.js`, `messages.js`, `rooms.js`).
- `sockets/`: Socket.IO configurations and event handlers (`chat.js`).
- `utils/`: Utility functions (e.g., validation logic).
- `server.js`: The entry point that sets up Express, connects to MongoDB, and binds the Socket.IO server.

## Request Flow
1. **Client Request**: HTTP requests are sent to specific route prefixes defined in `server.js` (e.g., `/auth`, `/users`, `/rooms`, `/messages`).
2. **Middleware Layer**: Requests pass through global middleware (like `express.json()` and `cors()`). Protected routes pass through `authMiddleware` which verifies the `Bearer` JWT token.
3. **Route Handling**: The router takes over, processes the business logic (creates a room, fetches messages, etc.), interacts with models, and returns JSON responses.

## Socket.IO Initialization
In `server.js`, a native `node:http` server wraps the Express app. Socket.IO is initialized on this server allowing it to share the same port as the REST API. The `initSocket(io)` function from `sockets/chat.js` is called to register the socket lifecycle and event handlers.
