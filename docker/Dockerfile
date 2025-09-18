# Étape build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force


# Copier le code source
COPY src ./src
COPY public ./public
COPY index.html ./

# Build de l'application
RUN npm run build

# Production stage - Use nginx for Vue.js SPA
FROM nginx:alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx

# Copy built application to nginx
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

USER nginx

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]