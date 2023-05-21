FROM node

WORKDIR /app

COPY ./main.js ./main.js
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./public ./public

RUN npm i
EXPOSE 3000
CMD [ "node", "main.js" ]