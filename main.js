const http = require('http');
const fs = require('fs');
const __PATH = "assets/";
const PORT = 80;

var messagesList = [];

//LOAD ALL PREVIOUS N-MESSAGES
function loadMessages(messageLimit = 200)
{
    messagesList = [];
    let rawJson = fs.readFileSync(__PATH + "messages.json");
    let messages = JSON.parse(rawJson);
    console.log(messages);
    var i = messages.length - messageLimit < 0 ? 0 : messages.length - messageLimit;
    for(; i < messages.length; i++)
    {
        messagesList.push(messages[i]);
    }
}

var server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("");
});

//SAVE MESSAGES
function addMessage(msgData) {
    let rawJson = fs.readFileSync(__PATH + "messages.json", (err, data) => {
        if(err) throw err;
    });
    let messages = JSON.parse(rawJson);
    messages.push(msgData);
    var nJson = JSON.stringify(messages);
    if(nJson != undefined) fs.writeFile(__PATH + "messages.json", nJson, (err) => {
        if(err) throw err;
    });
}

const io = require('socket.io').listen(server);

io.sockets.on('connection', (socket) => {
    console.log("Someone is connected, id: " + socket.id);
    socket.emit("connected", {id: socket.id, messages: messagesList});

    //IDK
    socket.on("iouu", () => {
        console.log("IOUUUU");
        socket.emit("iouu");
    });
    
    //WHEN RECIEVING A MESSAGE SEND THE MESSAGE TO ALL THE CONNECTED SOCKET
    socket.on("messageSent", (data) => {
        let nMessage = {user: data.user, content: data.msg, date: data.date};
        messagesList.push(nMessage);
        addMessage(nMessage);
        //console.log("Got some message :" + data.msg);
        io.emit("messageRecieved", {user: data.user, msg: data.msg});
    });
}); 

loadMessages();
server.listen(PORT);
