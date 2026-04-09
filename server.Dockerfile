FROM oven/bun:1 AS base
WORKDIR /app

COPY server/package.json server/bun.lock ./server/
RUN cd server && bun install --frozen-lockfile --production

COPY server/ ./server/
COPY shared/ ./shared/

WORKDIR /app/server
EXPOSE 3939
CMD ["bun", "run", "index.ts"]
