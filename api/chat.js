const uuidv4 = require('uuid').v4;

const messages = new Set();
const users = new Map();

const defaultUser = {
    id: 'anon',
    name: 'Anonymous',
};

const messageExpirationTimeMS = 5*60 * 1000;

class Connection {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;

        socket.on('getMessages', () => this.getMessages());
        socket.on('message', (value) => this.handleMessage(value));
        socket.on('disconnect', () => this.disconnect());
        socket.on('connect_error', (err) => {
            console.log(`connect_error due to ${err.message}`);
        });
        console.log("Connected")
    }

    sendMessage(message) {
        this.io.sockets.emit('message', message);
    }

    getMessages() {
        messages.forEach((message) => this.sendMessage(message));
    }

    handleMessage(value) {
        const message = {
            id: uuidv4(),
            user: users.get(this.socket) || defaultUser,
            value,
            time: Date.now()
        };

        messages.add(message);
        this.sendMessage(message);

        setTimeout(
            () => {
                messages.delete(message);
                this.io.sockets.emit('deleteMessage', message.id);
            },
            messageExpirationTimeMS,
        );
    }

    disconnect() {
        console.log("Disconnected")
        users.delete(this.socket);
    }
}

let rooms = []
let cur = 0
function chat(io) {
    io.on('connection', (socket) => {
        socket.join("room")
        console.log("Connected")



        socket.on("playPause", function(data){
            console.log(data)
            io.to("room").emit("playPause", data)
        })

        socket.on("startGame", function(data){
            console.log("Starting game")
            io.to("room").emit("startGame", data)
        })

        socket.on("disconnect", function(){
            console.log("Disconnected")
        })

        socket.on("joinRoom", function(roomName){
            socket.join(roomName)
        })
    });
}

module.exports = chat;