FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build application (TypeScript now available)
RUN npm run build

# Remove devDependencies after build (optional)
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]
