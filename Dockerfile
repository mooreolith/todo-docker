# syntax=docker/dockerfile:1

FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "todo-server.js"]
EXPOSE 3000
