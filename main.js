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

app.get("/health", (req, res) => {
    res.json({"healthy": true}).send
})

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
                ws.send(JSON.stringify({
                    "message": `You connected to the room "${message.login.room}" as "${message.login.userName}". There are now ${rooms[message.login.room].length} user(s) connected to this room.`,
                    "sender": "TheBaum's messaging server",
                    "time": new Date()
                }))
                rooms[message.login.room].forEach(user => {
                    if(user.OPEN && user != ws)
                    user.send(JSON.stringify({
                        "message": `User "${message.login.userName}" just connected. There are now ${rooms[message.login.room].length} user(s) connected to this room.`,
                        "sender": "TheBaum's messaging server",
                        "time": new Date()
                    }))
                })
            }
        }
    })

    ws.on("close", () => {
        const usersIndex = users.findIndex(e => e.ws === ws);
        const roomLeft = users[usersIndex].room
        const leavingUserName = users[usersIndex].userName
        const indexInRooms = rooms[roomLeft].findIndex(wsElem => wsElem == ws)
        rooms[roomLeft].splice(indexInRooms, 1)
        users.splice(usersIndex, 1)
        let brodcastMessage = ("User \"" + leavingUserName + "\" just left. There are now " + rooms[roomLeft].length + " user(s) connected to this room.")
        rooms[roomLeft].forEach(user => {
            user.send(JSON.stringify({
                "message": brodcastMessage,
                "sender": "TheBaum's messaging server",
                "time": new Date()
            }))
        })
        console.log(`removed User "${leavingUserName}" from room "${roomLeft}"`)
    })

    //TODO: send and load last 10 messages to and from database

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
