# Backend Setup Guide

## Prerequisites

1. **PostgreSQL Database**: Install and run PostgreSQL locally
2. **Node.js**: Ensure Node.js 18+ is installed
3. **npm**: Package manager for Node.js

## Environment Setup

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/homebase_gear_guard"
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN="http://localhost:5173"
   ```

## Database Setup

1. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE homebase_gear_guard;
   CREATE USER homebase_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE homebase_gear_guard TO homebase_user;
   ```

2. Generate and apply database migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Installation and Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Or start the production server:
   ```bash
   npm run start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Endpoints

The server will be available at `http://localhost:3001`

### Health Check
- `GET /health` - Server health status

### API Base URL
All API endpoints are prefixed with `/api`

## Testing

Once the server is running, you can test the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-09-13T...",
  "environment": "development"
}
```