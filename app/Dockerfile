FROM node:16.9.0-alpine
WORKDIR /app
COPY package.json ./
RUN npm i
COPY index.js /app/
EXPOSE 80
CMD ["node", "index.js"]