FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl1.1-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client with correct binaries
RUN npx prisma generate --no-engine

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
