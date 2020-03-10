FROM node:13-alpine
WORKDIR /app
COPY package.json /app
COPY . /app
EXPOSE 3000
RUN npm install
RUN npm run build
CMD npm start