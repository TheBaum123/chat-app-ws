FROM node

WORKDIR /app

COPY ./main.js ./main.js
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./public ./public

RUN npm i
EXPOSE 3000
CMD [ "node", "main.js" ]