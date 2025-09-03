FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for environment variables
ARG NEXT_PUBLIC_TS_API_URL
ARG NEXT_PUBLIC_RUST_API_URL

# Set environment variables for build
ENV NEXT_PUBLIC_TS_API_URL=$NEXT_PUBLIC_TS_API_URL
ENV NEXT_PUBLIC_RUST_API_URL=$NEXT_PUBLIC_RUST_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]