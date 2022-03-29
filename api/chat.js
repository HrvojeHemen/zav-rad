
//{
//   asd: { users: { '0': {score: xx}}, '1': {score: xx} } },
//   bsd: { users: { '1': {score: xx} } }
// }

let rooms = {}
let cur = 0

function chat(io) {
    io.on('connection', (socket) => {
        //socket.join("room")
        console.log("Connected")

        let alertRoomOfChange = function(){
            try{
                console.log("Emmiting current room")
                let currentRoom = socket['currentRoom']
                console.log(rooms[currentRoom]["users"])

                let res = []
                for (let [key, value] of Object.entries(rooms[currentRoom]["users"])) {
                    console.log(key, value)
                    console.log("Destructuring obj", value)
                    let {score, username} = value

                    res.push({"id":key,"score":score,"username":username})
                }
                io.to(socket['currentRoom']).emit("scoreBoardUpdate", res)
            }
            catch(err){
                console.log("Error caught", err)
                console.log("Probably because user got to play without joining a room first")
            }

        }

        let updateScoresIfNeeded = function(data){
            console.log(data)
            let {source, token1, token2, tokenBoth} = data;

            let addPoints = 0;
            if(token1){
                addPoints ++;
            }

            if(token2){
                addPoints ++;
            }

            // = 3, if token1 is correct or token2 is correct,
            // it would give too many points, so with =3 we reset it to max 3
            if(tokenBoth){
                addPoints = 3;
            }

            if(addPoints > 0){
                let currentRoom = socket['currentRoom']
                let userId = socket['userId']
                rooms[currentRoom]["users"][userId]['score'] += addPoints
                console.log("Points changed")
                console.log(rooms[currentRoom])

                //we added points, we alert room of change
                alertRoomOfChange()
            }

        }



        let leaveCurrentRoomIfInAny = function(){
            if (socket['currentRoom'] !== undefined) {
                let currentRoom = socket['currentRoom']

                console.log("Left a room with name", currentRoom)
                socket.leave(currentRoom)


                delete rooms[currentRoom]["users"][socket['userId']];

                //we left the room, we alert that someone left
                alertRoomOfChange()


                if( Object.keys( rooms[currentRoom]["users"]).length < 1){
                    console.log("Deleting current room because it was empty")
                    delete rooms[currentRoom]
                }

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

        socket.on("startGameServerHost", async function (data){

            let {queue} = data;
            let room = socket['currentRoom'];
            if(room !== undefined){
                console.log("Starting queue: " + queue)

                while (queue.length > 0 && room in rooms){
                    let song = queue.pop();

                    io.to(socket['currentRoom']).emit("playSong", song);


                    //wait 5 sec
                    await new Promise(r => setTimeout(r,5000));

                    io.to(socket['currentRoom']).emit("showTitle", song);



                    //wait 2 sec
                    await new Promise(r => setTimeout(r,2000));

                }

                io.to(socket['currentRoom']).emit("quizDone");
            }

        })


        socket.on("chatMessage", function (data) {
            console.log("Emitting chat message to the game room")
            console.log(data)
            updateScoresIfNeeded(data)
            io.to(socket['currentRoom']).emit("chatMessage", data)
        })

        socket.on("disconnect", function () {
            leaveCurrentRoomIfInAny();
            console.log("Disconnected")
        })



        socket.on("joinRoom", function (data) {
            let {roomName, userId, username} = data;
            // console.log(`User with id "${userId}" joined room "${roomName}"`)

            leaveCurrentRoomIfInAny();

            socket['currentRoom'] = roomName;
            socket['userId'] = userId;
            socket.join(roomName)

            let currentRoom = socket['currentRoom']
            //if room doesnt exist create it
            if (rooms[currentRoom] === undefined) {
                rooms[currentRoom] = {"users": {}}
            }

            rooms[currentRoom]["users"][userId] =  {"score": 0, "username": username }

            //we joined the room, we alert it
            alertRoomOfChange()

            }
        )

        });
    }

    module.exports = chat;