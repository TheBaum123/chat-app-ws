const ws = require("ws")
const http = require("http")
const express = require("express")

const app = express()

const server = http.createServer(app)

require("dotenv").config()

const port = process.env.PORT || 3000


const wss = new ws.Server({ server })

wss.on("connection", ws => {

    //send data from database

    ws.send(JSON.stringify({
        message:"Welcome to TheBaum's messaging server.",
        sender:"TheBaum's messaging server",
        time: new Date()
    }))

    ws.on("message", (message, isBinary) => {
        wss.clients.forEach(client => {
            if(client != ws && client.OPEN) {
                client.send(message, {binary: isBinary})
            }
        })
    })
})

function distributeMessage(message, isBinary) {

}


app.use(express.static("public"))


server.listen(port, () => {
    console.log("listening on port " + port)
})
