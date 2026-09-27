# Prisma's generated client (backend/generated/) is produced on the host by
# `npm run db:generate` in db/ (see scripts/build-and-run.sh) — it is
# gitignored but must already exist on disk before this image is built,
# since this Dockerfile does not run `prisma generate` itself.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# Next's standalone server.js reads PORT itself (default 3000) — must match
# the container port podman-compose publishes, or nothing listens on 4000.
ENV PORT=4000
COPY --from=build /app/.next/standalone ./

EXPOSE 4000
CMD ["node", "server.js"]
