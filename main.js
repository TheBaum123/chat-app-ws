const ws = require("ws")
const http = require("http")
const express = require("express")

const port = process.env.PORT || 3000

let users = []
let rooms = {}

const app = express()

const server = http.createServer(app)

require("dotenv").config()


const wss = new ws.Server({ server })

wss.on("connection", ws => {

    ws.on("message", (message) => {
        message = JSON.parse(message.toString())
        if(message.login) {
            const index = users.findIndex(e => e.ws === ws);
            if (index < 0) {
                users.push({
                    ws: ws,
                    userName: message.login.userName,
                    room: message.login.room
                })
                if(rooms[message.login.room]) {
                    rooms[message.login.room].push(ws)
                } else {
                    rooms[message.login.room] = [ws]
                }
                console.log("registered User \"" + message.login.userName + "\" in room \"" + message.login.room + "\"")
            }
        }
    })

    //!TODO: remove logged of users from the system

    //TODO: send last 10 messages to and from database

    ws.send(JSON.stringify({
        message:"Welcome to TheBaum's messaging server.",
        sender:"TheBaum's messaging server",
        time: new Date()
    }))

    ws.on("message", (message, isBinary) => {
        const index = users.findIndex(e => e.ws === ws);
        if (index > -1) {
            users.forEach(user => {
                if(user.ws != ws && user.ws.OPEN && user.room == users[index].room && !JSON.parse(message.toString()).login) {
                    user.ws.send(JSON.stringify({
                        "message": JSON.parse(message.toString()).message,
                        "time": JSON.parse(message.toString()).time,
                        "sender": users[index].userName
                    }), {binary: isBinary})
                }
            })
        }
    })
})


app.use(express.static("public"))


server.listen(port, () => {
    console.log("listening on port " + port)
})
