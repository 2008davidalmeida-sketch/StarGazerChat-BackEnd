# Deployment Guide (Railway & MongoDB Atlas)

## 1. Connecting the GitHub Repo
1. Sign up / Log in to [Railway](https://railway.app/).
2. Create a new project and select **Deploy from GitHub repo**.
3. Point it to this repository: `StarGazerChat` (backend repository).

## 2. Setting Environment Variables
Ensure the following variables are configured under the **Variables** tab in your Railway App:
- `PORT`: Railway sets this automatically but you can hardcode it to `3000`.
- `JWT_SECRET`: A secure, cryptographically random string token.
- `MONGO_URI`: Your MongoDB connection string leading to Atlas.

## 3. MongoDB Atlas Configuration
If using MongoDB Atlas:
1. Go to the **Network Access** section in your Atlas dashboard.
2. Ensure you have added the Railway outbound IPs or simply allow access from anywhere `0.0.0.0/0`.
3. Check the **Database Access** side menu to ensure you have a valid user and password (no special characters that require heavy URL encoding for simplicity, or encode them properly).

## 4. Generating a Domain
1. In Railway, go to the **Settings** tab of your deployed service.
2. Scroll to the **Environment** section > **Domains**.
3. Click "Generate Domain" to create a public HTTPS URL (e.g., `stargazerchat-production.up.railway.app`).
4. You will use this API URL in your front-end repository configuration.
