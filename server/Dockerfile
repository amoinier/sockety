FROM node:13-alpine as builder
WORKDIR /app
COPY package.json /app
COPY src/ /app/src/
COPY public/ /app/public/
COPY tsconfig.json /app
RUN npm install
RUN npm run build

FROM node:13-alpine
WORKDIR /app
COPY --from=builder /app/package.json /app
COPY --from=builder /app/dist/ /app/dist/
RUN npm install --only=prod
EXPOSE 3000
CMD npm start
