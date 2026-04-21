FROM node:22-alpine

COPY . /app

WORKDIR /app/apps/app-name

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
