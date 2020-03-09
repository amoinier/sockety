FROM node:13-alpine
WORKDIR /app
COPY package.json /app
COPY . /app
RUN npm install
RUN npm run build
CMD npm start