FROM node:18-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder

WORKDIR /app
ARG NEXT_PUBLIC_HCAPTCHA_SITEKEY
ENV NEXT_PUBLIC_HCAPTCHA_SITEKEY=$NEXT_PUBLIC_HCAPTCHA_SITEKEY
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
