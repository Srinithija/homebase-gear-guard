# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for both frontend and backend
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install all dependencies (including devDependencies for build)
RUN npm ci
RUN cd backend && npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Build the backend
RUN cd backend && npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production
RUN cd backend && npm prune --production

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start the backend server
CMD ["npm", "run", "start:backend"]