//{
//   asd: { users: { '0': {score: xx}}, '1': {score: xx} } },
//   bsd: { users: { '1': {score: xx} } }
// }
const SONG_LENGTH = 20000;
const TITLE_LENGTH = 5000;

let rooms = {}
let cur = 0

function chat(io) {
    io.on('connection', (socket) => {
        //socket.join("room")
        console.log("Connected")

        let alertRoomOfChange = function () {

            try {
                console.log("Emmiting current room")
                let currentRoom = socket['currentRoom']
                console.log(rooms[currentRoom]["users"])

                let res = []
                for (let [key, value] of Object.entries(rooms[currentRoom]["users"])) {
                    console.log(key, value)
                    console.log("Destructuring obj", value)
                    let {score, username, ready, chatColor, skip} = value
                    res.push({"id": key, "score": score, "username": username, "ready": ready, "chatColor": chatColor, "skip" : skip})
                }
                //OVDJE SAM BIO REMOVEAO DUPLIKAT LINIJU IDK ZASTO JE BILO, AKO NES NE RADI MYB OVO
                io.to(socket['currentRoom']).emit("scoreBoardUpdate", res)
                // io.to(socket['currentRoom']).emit("scoreBoardUpdate", res)

            } catch (err) {
                console.log("Error caught", err)
                console.log("Probably because user got to play without joining a room first")
            }

        }


        let resetScores = function () {
            let currentRoom = socket['currentRoom']
            if (rooms[currentRoom] !== undefined) {
                for (const us in rooms[currentRoom]["users"]) {
                    rooms[currentRoom]["users"][us]['score'] = 0
                    rooms[currentRoom]["users"][us]['skip'] = false
                }
            }
        }
        let resetSkips = function() {
            let currentRoom = socket['currentRoom']
            if (rooms[currentRoom] !== undefined) {
                for (const us in rooms[currentRoom]["users"]) {
                    rooms[currentRoom]["users"][us]['skip'] = false
                }
            }
        }
        let shouldISkip = function() {
            let currentRoom = socket['currentRoom']
            if( rooms[currentRoom] === undefined ) return false;
            let count = 0
            let total = 0

            for(const us in rooms[currentRoom]["users"]){
                let user = rooms[currentRoom]["users"][us]
                if(user['skip']) count++
                total++
            }

            if (total === 0) return false
            return count / total > 0.5
        }

        let updateScoresIfNeeded = function (data) {
            let currentRoom = socket['currentRoom']
            if (currentRoom === undefined) {
                return;
            }
            if (!rooms[currentRoom]['allowedToGuess']) return

            console.log(data)
            let {source, token1, token2, tokenBoth} = data;

            let addPoints = 0;
            if (token1) {

                rooms[currentRoom]['guessed'][0] = true;
                addPoints++;
            }

            if (token2) {

                rooms[currentRoom]['guessed'][1] = true
                addPoints++;
            }

            console.log("G " + rooms[currentRoom]['guessed'])

            // = 3, if token1 is correct or token2 is correct,
            // it would give too many points, so with =3 we reset it to max 3
            if (tokenBoth) {
                addPoints = 3;
            }

            if (addPoints > 0 || rooms[socket['currentRoom']]['users'][source]['skip']) {
                let userId = socket['userId']
                rooms[currentRoom]["users"][userId]['score'] += addPoints
                console.log("Points changed")
                console.log(rooms[currentRoom])

                //we added points, we alert room of change
                alertRoomOfChange()
            }

        }


        let leaveCurrentRoomIfInAny = function () {
            try{
                let currentRoom = socket['currentRoom']
                console.log(currentRoom)

                if (currentRoom !== undefined) {

                    console.log("Left a room with name", currentRoom)
                    socket.leave(currentRoom)

                    delete rooms[currentRoom]["users"][socket['userId']];

                    //we left the room, we alert that someone left
                    alertRoomOfChange()


                    if (Object.keys(rooms[currentRoom]["users"]).length < 1) {
                        console.log("Deleting current room because it was empty")
                        delete rooms[currentRoom]
                    }

                }

                //just in case
                socket.leaveAll();
            }
            catch (e) {
                console.log("ERROR IN LEAVECURRENTROOMIFANY")
                console.log(e)
            }
        }

        socket.on("playPause", function (data) {
            console.log(data)
            io.to(socket['currentRoom']).emit("playPause", data)
        })


        socket.on("startGame", function (data) {
            console.log("Starting game")
            console.log("With Data")
            console.log(data)
            io.to(socket['currentRoom']).emit("startGame", data)
        })

        socket.on("startGameServerHost", async function (data) {

            let {queue} = data;
            let songs = queue.songs
            let currentRoom = socket['currentRoom'];
            let counter = 0;

            for (let [key, value] of Object.entries(rooms[currentRoom]["users"])) {
                let {ready, username} = value;
                if (!ready) {
                    console.log("USER NOT READY " + username)
                    io.to(currentRoom).emit("quizDone");
                    return
                }
            }
            resetScores();
            try {
                console.log("Playing songs " + songs, ",", songs.length)
                if (currentRoom !== undefined) {
                    while (songs.length > 0 && currentRoom in rooms) {
                        let song = songs.pop();
                        console.log("Playing" + counter++)


                        //play song, allow guessing and wait X seconds
                        io.to(currentRoom).emit("playSong", song);
                        rooms[currentRoom]['allowedToGuess'] = true;
                        resetSkips()
                        alertRoomOfChange()


                        rooms[currentRoom]['guessed'] = [false, false]
                        let early = false;
                        for (let i = 0; i < 50; i++) {

                            await new Promise(r => setTimeout(r, SONG_LENGTH / 50));

                            if (rooms[currentRoom] && rooms[currentRoom]['guessed'] && rooms[currentRoom]['guessed'][0] && rooms[currentRoom]['guessed'][1]
                            || shouldISkip()) {
                                console.log("QUITTING EARLY")
                                early = true
                                break
                            }
                        }

                        //if (early) continue

                        //show title, disable guessing and wait Y seconds
                        io.to(currentRoom).emit("showTitle", song);
                        rooms[currentRoom]['allowedToGuess'] = false;
                        await new Promise(r => setTimeout(r, TITLE_LENGTH));

                    }
                    console.log("EMMITING DONE")
                    io.to(currentRoom).emit("quizDone");
                    rooms[currentRoom]['allowedToGuess'] = false;
                }
            } catch (err) {
                console.log("err in start quiz")
            }


        })


        socket.on("chatMessage", function (data) {
            console.log("Emitting chat message to the game room")

            let chatColor = "#008080"
            try {

                let {message} = data
                if(message.toLowerCase() === "!skip"){
                    rooms[socket['currentRoom']]['users'][data.source]['skip'] = true
                }

                chatColor = rooms[socket['currentRoom']]['users'][data.source].chatColor
            } catch (e) {
                console.log("User doesnt exist")
            }
            data['chatColor'] = chatColor
            updateScoresIfNeeded(data)
            console.log(data)
            io.to(socket['currentRoom']).emit("chatMessage", data)
        })

        socket.on("disconnect", function () {
            leaveCurrentRoomIfInAny();
            console.log("Disconnected")
        })

        socket.on("leaveRoom", function() {
            leaveCurrentRoomIfInAny()
            console.log("Disconnected manually with leave Room")
        })

        socket.on("changeReady", function (data) {
            let {userId, ready} = data;
            let currentRoom = socket['currentRoom']
            if (currentRoom === undefined) {
                return
            }
            console.log("User ready? ", userId, ready)
            rooms[currentRoom]["users"][userId]['ready'] = ready;
            alertRoomOfChange()
        })


        socket.on("joinRoom", function (data) {
            let randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
            let {roomName, userId, username} = data;
            // console.log(`User with id "${userId}" joined room "${roomName}"`)

            leaveCurrentRoomIfInAny();

            socket['currentRoom'] = roomName;
            socket['userId'] = userId;
            socket['chatColor'] = randomColor;
            socket.join(roomName);

            let currentRoom = socket['currentRoom']
            //if room doesnt exist create it
            if (rooms[currentRoom] === undefined) {
                rooms[currentRoom] = {"users": {}}
            }

            rooms[currentRoom]["users"][userId] = {
                "score": 0,
                "username": username,
                "ready": false,
                "chatColor": randomColor
            }

            //we joined the room, we alert it
            alertRoomOfChange()
        })

        socket.on("checkRoom", function () {

            let currentRoom = socket['currentRoom'];
            io.to(socket.id).emit("checkRoom", currentRoom)
        })
    });
}

module.exports = chat;