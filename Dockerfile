# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production
RUN cd backend && npm ci --only=production

# Copy source code
COPY . .

# Build the backend
RUN cd backend && npm run build

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start the backend server
CMD ["npm", "run", "start:backend"]