# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for environment variables (needed at build time for Nuxt)
ARG NUXT_PUBLIC_API_BASE_URL=http://ecombackend.ecom.astracaisse.com
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy built application
COPY --from=builder /app/.output ./.output

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]
