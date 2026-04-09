FROM oven/bun:1 AS build
WORKDIR /app

COPY client/package.json client/bun.lock ./client/
RUN cd client && bun install --frozen-lockfile

COPY client/ ./client/
COPY shared/ ./shared/

WORKDIR /app/client
RUN bun run build

FROM node:20-slim AS production
WORKDIR /app

COPY --from=build /app/client/build ./build
COPY --from=build /app/client/package.json ./
COPY --from=build /app/client/node_modules ./node_modules

EXPOSE 3000
CMD ["npx", "react-router-serve", "./build/server/index.js"]
