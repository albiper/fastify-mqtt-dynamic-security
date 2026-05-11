FROM node:latest

WORKDIR /app
COPY . .

RUN npm ci && npm run build

ENTRYPOINT [ "node", "example/simple.js" ]

EXPOSE 3000