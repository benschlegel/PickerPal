FROM node:latest AS builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile

RUN yarn build

FROM alpine
RUN apk add --update nodejs

WORKDIR /app

COPY --from=builder /app/build/index.js ./index.js

CMD ["node", "index.js"]
