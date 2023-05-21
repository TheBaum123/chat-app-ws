const ws = require("ws")
const http = require("http")
const express = require("express")
const {MongoClient, ServerApiVersion} = require("mongodb")

require("dotenv").config()

const port = process.env.PORT || 3000
const logging = process.env.LOGGING

let users = []
let rooms = {}

const mongoUserName = process.env.MONGODBUSERNAME
const mongoPassword = process.env.MONGODBPASSWORD
const mongoClusterName = process.env.MONGODBCLUSTERNAME
const mongoURLEnd = process.env.MONGODBURLEND
const mongoDataBase = process.env.HISTORYDB || "prod"
const mongoCol = process.env.HISTORYCOL || "latestMessages"
let messageHistoryLength
let mongoURI
if(mongoClusterName && mongoPassword && mongoUserName && mongoURLEnd) {
    messageHistoryLength = process.env.HISTORYLENGTH || 10
    mongoURI = `mongodb+srv://${mongoUserName}:${mongoPassword}@${mongoClusterName}.${mongoURLEnd}.mongodb.net/?retryWrites=true&w=majority`
} else {
    messageHistoryLength = 0
}

let mongoClient

if(mongoURI) {
    mongoClient = new MongoClient(mongoURI, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    })
}


if(messageHistoryLength) {
    if(logging) console.log(`A message history of ${messageHistoryLength} messages will be kept on the mongodb cluster ${`mongodb+srv://${mongoUserName}:<password>@${mongoClusterName}.${mongoURLEnd}.mongodb.net/?retryWrites=true&w=majority`}`)
    if(logging) console.log(`Messages will be kept in the database "${mongoDataBase}" under the collection "${mongoCol}"`)
    if(mongoPassword) {
        console.log("a password is present, but wont be logged for obvious security reasons.")
    } else {
        console.log("YOU FORGOT SETTING THE \"MONGODBPASSWORD\" ENVIROMENT VARIABLE.")
    }
} else {
    if(logging) {
        console.log("tip: did you know you can use this app connected to a mongodb databese for message persistence?")
    }
}

const app = express()

const server = http.createServer(app)


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
                if(logging) console.log(`registered User "${message.login.userName}" in room "${message.login.room}" with the ip ${ws._socket.remoteAddress}`)
                rooms[message.login.room].forEach(user => {
                    if(user.OPEN && user != ws)
                    user.send(JSON.stringify({
                        "message": `User "${message.login.userName}" just connected. There are now ${rooms[message.login.room].length} user(s) connected to this room.`,
                        "sender": "TheBaum's messaging server",
                        "time": new Date()
                    }))
                })
            }

            if(messageHistoryLength) {
                let previousMessages = []

                async function queryDatabase() {
                    try {
                        const database = mongoClient.db(mongoDataBase)
                        const col = database.collection(mongoCol)

                        const query = {room: message.login.room}
                        let messagesFromRoom = await col.findOne(query)

                        if(messagesFromRoom) {
                            previousMessages = messagesFromRoom.messages
                            previousMessages.forEach(elem => {
                                ws.send(JSON.stringify({
                                    "message": elem.message,
                                    "sender": elem.sender,
                                    "time": elem.time
                                }))
                            })
                        }
                        
                        ws.send(JSON.stringify({
                            "message": `You connected to the room "${message.login.room}" as "${message.login.userName}". There are now ${rooms[message.login.room].length} user(s) connected to this room.`,
                            "sender": "TheBaum's messaging server",
                            "time": new Date()
                        }))
                    } finally {
                        
                    }
                }

                queryDatabase().catch(console.dir)
            } else {
                ws.send(JSON.stringify({
                    "message": `You connected to the room "${message.login.room}" as "${message.login.userName}". There are now ${rooms[message.login.room].length} user(s) connected to this room.`,
                    "sender": "TheBaum's messaging server",
                    "time": new Date()
                }))
            }
        }
    })

    ws.send(JSON.stringify({
        message:"Welcome to TheBaum's messaging server.",
        sender:"TheBaum's messaging server",
        time: new Date()
    }))

    ws.on("message", (message, isBinary) => {
        const index = users.findIndex(e => e.ws === ws);
        if (index > -1 && !JSON.parse(message.toString()).login) {

            let messageToSave = JSON.parse(message.toString())
            messageToSave["sender"] = users[index].userName

            if(messageHistoryLength){updateDatabase(users[index].room, messageToSave)}

            users.forEach(user => {
                if(user.ws != ws && user.ws.OPEN && user.room == users[index].room && !JSON.parse(message.toString()).login) {
                    user.ws.send(JSON.stringify(messageToSave), {binary: isBinary})
                }
            })
        }
    })

    ws.on("close", () => {
        const usersIndex = users.findIndex(e => e.ws === ws);
        if(usersIndex > -1) {
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
            if(logging) console.log(`removed User "${leavingUserName}" from room "${roomLeft}"`)
        }
    })

})


app.use(express.static("public"))


server.listen(port, () => {
    if(logging) console.log("listening on port " + port)
})


async function updateDatabase(room, message) {
    try {
        const database = mongoClient.db(mongoDataBase)
        const col = database.collection(mongoCol)

        const filter = {room: room}

        const options = {upsert: true}

        const query = {room: room}
        
        let messagesFromRoom = await col.findOne(query)
        let previousMessages = []

        if(messagesFromRoom) {
            previousMessages = messagesFromRoom.messages
            if(messageHistoryLength > 1) {
                while(previousMessages.length > messageHistoryLength - 1) {
                    previousMessages.splice(0, 1)
                }
            }
            previousMessages.push(message)
            if(messageHistoryLength == 0) {
                previousMessages = []
            }
            if(messageHistoryLength == 1) {
                previousMessages = [message]
            }
        } else {
            previousMessages = [message]
        }

        let updateDoc = {
            $set: {
                "messages": previousMessages
            }
        }

        await col.updateOne(filter, updateDoc, options)

    }
    finally {
        
    }
}

process.on("SIGINT", async function() {
    if(logging) console.log("closing mongodb connection")
    await mongoClient.close()
    if(logging) console.log("conection to mongodb closed")
    process.exit()
})