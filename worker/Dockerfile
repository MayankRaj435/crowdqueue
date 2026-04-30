FROM node:20-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S workerapp -u 1001
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --chown=workerapp:nodejs . .
USER workerapp
CMD ["node", "src/worker.js"]
