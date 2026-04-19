# Setup Guide

## Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a MongoDB Atlas URI
- Git

## Cloning the Repository
```bash
git clone https://github.com/2008davidalmeida-sketch/StarGazerChat.git
cd StarGazerChat
```

## Installing Dependencies
Run the following command to install required packages:
```bash
npm install
```

## Environment Variables
Create a `.env` file in the root of the project with the following required variables:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Running Locally
To start the server in development mode, run:
```bash
node server.js
```

## Running Tests
Currently, no test scripts are configured. Once configured, you can run tests with:
```bash
npm test
```
