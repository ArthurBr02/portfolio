FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/src ./src
COPY backend/tsconfig.json ./
COPY --from=frontend-build /app/frontend/dist ./public
RUN mkdir -p uploads
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "--import", "tsx/esm", "src/index.ts"]
