const ws = new WebSocket("wss://" + location.hostname + ":3000")

const sendBox = document.getElementById("send-box")
const sendForm = document.getElementById("send-form")
const nameBox = document.getElementById("name-box")

const loginDialog = document.getElementById("login-dialog")
const loginForm = document.getElementById("login-form")
const userNameInput = document.getElementById("username-input")
const roomNameInput = document.getElementById("roomname-input")
const loginInput = document.getElementById("login-input")

const receivingWrapper = document.getElementById("messages-wrapper")

loginDialog.showModal()

loginForm.addEventListener("submit", e => {
    e.preventDefault()

    ws.send(JSON.stringify({
        "login": {
            "userName": userNameInput.value,
            "room": roomNameInput.value
        }
    }))

    loginDialog.close()
})

sendForm.addEventListener("submit", e => {
    let autoScroll

    if(window.scrollY + window.innerHeight > document.body.clientHeight) {
        autoScroll = true
    }

    e.preventDefault()
    if(sendBox.value) {
        ws.send(JSON.stringify({
            message: sendBox.value,
            time: new Date()
        }))

        const messageTime = new Date()
        const outTime = `${messageTime.getDate()}.${messageTime.getMonth() + 1}.${messageTime.getFullYear()} - ${messageTime.getHours()}:${messageTime.getMinutes()}`

        let newMessage = document.createElement("div")
        newMessage.classList.add("sent-message")

        let newMessageSender = document.createElement("span")
        newMessageSender.classList.add("sender-name")
        let newMessageSenderText = document.createTextNode("You")
        newMessageSender.appendChild(newMessageSenderText)

        let newMessageMessage = document.createElement("span")
        newMessageSender.classList.add("message")
        let newMessageMessageText = document.createTextNode(sendBox.value)
        newMessageMessage.appendChild(newMessageMessageText)

        let newMessageTime = document.createElement("span")
        newMessageTime.classList.add("message-time")
        let newMessageTimeText = document.createTextNode(outTime)
        newMessageTime.appendChild(newMessageTimeText)

        newMessage.appendChild(newMessageSender)
        newMessage.appendChild(newMessageMessage)
        newMessage.appendChild(newMessageTime)

        receivingWrapper.appendChild(newMessage)

        sendBox.value = ""
    }

    if(autoScroll) {
        scrollDown()
    }
})

ws.addEventListener("message", message => {

    console.log(message)

    let autoScroll

    if(window.scrollY + window.innerHeight > document.body.clientHeight) {
        autoScroll = true
    }

    message = JSON.parse(message.data)

    const messageTime = new Date(message.time)
    const outTime = `${messageTime.getDate()}.${messageTime.getMonth() + 1}.${messageTime.getFullYear()} - ${messageTime.getHours()}:${messageTime.getMinutes()}`

    let newMessage = document.createElement("div")
    newMessage.classList.add("received-message")

    let newMessageSender = document.createElement("span")
    newMessageSender.classList.add("sender-name")
    let newMessageSenderText = document.createTextNode(message.sender)
    newMessageSender.appendChild(newMessageSenderText)

    let newMessageMessage = document.createElement("span")
    newMessageSender.classList.add("message")
    let newMessageMessageText = document.createTextNode(message.message)
    newMessageMessage.appendChild(newMessageMessageText)

    let newMessageTime = document.createElement("span")
    newMessageTime.classList.add("message-time")
    let newMessageTimeText = document.createTextNode(outTime)
    newMessageTime.appendChild(newMessageTimeText)

    newMessage.appendChild(newMessageSender)
    newMessage.appendChild(newMessageMessage)
    newMessage.appendChild(newMessageTime)

    receivingWrapper.appendChild(newMessage)

    if(autoScroll) {
        scrollDown()
    }
})

function scrollDown() {
    window.scrollTo(0, document.body.scrollHeight);
}