# chat-app by TheBaum
This is a chat app made by me, to see what i can make in 4 days.
### DISCLAIMER:
There is no encryption in place. Please dont communicate sensitive information over this chat.

## Table of contents
- [Demo](#demo)
- [Limitations](#limitations)
- [How to: selfhost](#how-to-selfhost)
    - [Using Docker](#using-docker)
        - [Without mongodb and persistent messages in docker](#without-mongodb-and-persistent-messages-in-docker)
        - [With mongodb and persistent messages in docker](#with-mongodb-and-persistent-messages-in-docker)
        - [With and without mongodb and persistent messages in docker](#with-and-without-mongodb-ans-persistent-messages-in-docker)
    - [Using a node.js server](#using-a-nodejs-server)
        - [Without mongodb and persistent messages in node.js](#without-mongodb-and-persistent-messages-in-nodejs)
        - [With mongodb and persistent messages in node.js](#with-mongodb-and-persistent-messages-in-nodejs)
    - [The values of the enviroment variables](#the-values-of-the-enviroment-variables)
---

### Demo:
A publicly hosted version of this chat app can be accessed and tested [here](https://chat-app-6bnk.onrender.com/). Note, that anything you send there is kept in my database and can be seen by me and I can see your ip address upon you connecting. Your ip address is not visible for anyone else appart from me.
### Limitations:
The message length is limited to 2500 characters for speed reasons. The username and room names have a maximum lenghth of 100 characters each.
### How to: selfhost
If you want to selfhost this app, you can do so in a docker container, or on any nodejs server.

#### Using Docker:
##### Without mongodb and persistent messages in docker:
```sh
docker run -p <port>:3000 \
-e LOGGING=true \
--name <container-name>
```
[Click here](#the-values-of-the-enviroment-variables) to see what to replace the values in the "<>" with.
##### With mongodb and persistent messages in docker:
```sh
docker run -p <port>:3000 \
-e MONGODBUSERNAME=<mongodb-user-name> \
-e MONGODBPASSWORD=<mongodb-password> \
-e MONGODBCLUSTERNAME=<mongodb-cluster-name> \
-e MONGODBURLEND=<mongodb-url-end> \
-e HISTORYDB=<mongodb-database-name> \
-e HISTORYCOL=<mongodb-collection-name> \
-e HISTORYLENGTH=<history-length> \
-e LOGGING=true \
--name <container-name>
```
[Click here](#the-values-of-the-enviroment-variables) to see what to replace the values in the "<>" with.
#### With and without mongodb ans persistent messages in docker:
Replace `<container-name>` with the name you want the container to have.

#### Using a node.js server:
If you want to selfhost this on a nodejs server you can do so by running the commands:
##### Without mongodb and persistent messages in node.js:
```sh
git clone https://github.com/TheBaum123/chat-app-ws.git ./chat-app
cd ./chat-app
npm i
node .
```
##### With mongodb and persistent messages in node.js:
Run the commands:
```sh
git clone https://github.com/TheBaum123/chat-app-ws.git ./chat-app
cd ./chat-app
npm i
touch ./.env
```
Open the `.env` file in your `chat-app` directory in any text editor and write:
```
MONGODBUSERNAME=<mongodb-user-name>
MONGODBPASSWORD=<mongodb-password>
MONGODBCLUSTERNAME=<mongodb-cluster-name>
MONGODBURLEND=<mongodb-url-end>
HISTORYDB=<mongodb-database-name>
HISTORYCOL=<mongodb-collection-name>
HISTORYLENGTH=<mongodb-history-length>
LOGGING=true
```
[Click here](#the-values-of-the-enviroment-variables) to see what to replace the values in the "<>" with.

Now go back to your terminal session in the chat-app directory and run:
```sh
node .
```
#### The values of the enviroment variables

If you dont want any logging to the console, **dont** set the `LOGGING` enviroment variable at all.

Replace `<cmongodb-user-name>` with the username you want to use to log into mongodb.

Replace `<mongodb-password>` with the password belonging to that username.

Replace `<mongodb-cluster-name>` with the name you want the container to have.

Replace `<mongodb-url-end>` with the random ending of the url. (see below)

Replace `<mongodb-database-name>` with the name of the databese in the cluster, that you want to store the history in. (defaults to prod)

Replace `<mongodb-collection-name>` with the name of the collection in the cluster, that you want to store the history in. (defaults to latestMessages)

Replace `<history-length>` with the ammount of messages you want to keep in the history per room. (defaults to 10 if not set)

Replace `<container-name>` with the name you want the container to have.

If you are missing any of these informations, you can (if you are using mongodb cloud) go to your database deployments and click on any connect, then click on any of the options (for example Drivers) and  find the information in the connection string under step three. The information is formatted in the connection string as follows:
`mongodb+srv://<mongodb-user-name>:<mongodb-password>@<mongodb-cluster-name>.<mongodb-url-end>.mongodb.net/?retryWrites=true&w=majority`