# Standard Dockerfile (Before Hardening)
# Demonstrates a typical development-heavy transition baseline

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY app/package*.json ./
RUN npm install

# Stage 2: Runtime
# Uses standard Alpine which includes shell and package manager by default
FROM node:20-alpine
WORKDIR /app

# Copy dependencies and source
COPY --from=build /app/node_modules ./node_modules
COPY app/ .

# NOTE: Standard images often run as 'root' by default in many tutorials
# This provides a clear contrast to DHI's non-root enforcement

ENV PORT=3000
ENV NODE_ENV=development

EXPOSE 3000
CMD ["node", "server.js"]
