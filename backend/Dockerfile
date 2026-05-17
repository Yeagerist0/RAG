FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy backend source
COPY backend ./backend

# Build TypeScript
RUN cd backend && npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "backend/dist/index.js"]
