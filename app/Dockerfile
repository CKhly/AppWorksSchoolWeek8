FROM node:16.9.0-alpine
WORKDIR /app
COPY package.json ./
RUN npm i
COPY server.js /app/
EXPOSE 4000
CMD ["node", "server.js"]