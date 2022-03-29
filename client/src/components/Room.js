import React, {Component} from "react";
import ReactPlayer from "react-player";
import NavBar from "./NavBar";
import {socket} from "./socket";
import {auth} from "./useTokenClass";
import {
    Box,
    Button, Center,
    HStack,
    Input,
    Progress,
    Select,
    Table,
    Tbody,
    Td, Text,
    Tr,
    VStack
} from '@chakra-ui/react'
import jwt from "jsonwebtoken";


class Room extends Component {
    amountOfSongs = 10;
    decoded = jwt.decode(auth.token)
    songLength = 1000;
    afterSongHintLength = 2500;
    // 1 / allowedDistance, 5 -> 20% mistake allowed
    allowedDistance = 5
    fuzzball = require('fuzzball');


    componentDidMount() {
        //console.log("Mounted")
        //console.log(this.decoded)
        fetch(process.env.REACT_APP_API_URL + "/playlist/user/" + this.decoded.id)
            .then(res => res.json())
            .then(
                (result) => {
                    //console.log("Playliste: ", result)
                    this.setState({playlistsForThisUser: result})
                },
                (error) => {
                    console.log("Error in api fetch", error)
                }
            )


        socket.on("playPause", function (data) {
            console.log("Received play:", data.playing)
            //console.log("Data", data)
            if (data.playing !== this.state.playing) {
                console.log("Pausing from different source");
                this.handlePlayPause();
                //this.setState({currentTimer : data.timer})
            }
        }.bind(this))
            //when one in room starts the game others start it aswell
            .on("startGame", function (data) {
                console.log("NSP AA")
                console.log(data)
                let source = data['source']
                let queue = data['queue']
                //console.log("Data received:", data)
                //console.log("this.decoded in socket", this.decoded)
                // if (source === this.decoded.id) {
                //     console.log("Start from same source, ignoring it")
                //     return
                // }
                //console.log(this.state)
                //console.log("Start variable in socket req reciever: ", this.state.started)
                if (!this.state.started) {
                    console.log("NSP POCINJEM")
                    this.setState({
                            queue: [...queue.songs],
                            startButtonVisible: false,
                            started: true
                        }
                        , () => {
                            this.startGame();
                        })
                }

            }.bind(this))

            .on("chatMessage", function (data) {
                this.handleMessageReceived(data);
            }.bind(this))
            .on("scoreBoardUpdate", function (data) {
                    this.handleScoreBoardUpdate(data);
                }.bind(this)
            )

    }

    handleScoreBoardUpdate = function (data) {
        let newScores = []
        for (let i = 0; i < data.length; i++) {
            let {score, username} = data[i]
            newScores.push(
                {
                    "score": score,
                    "username": username
                }
            )
        }
        console.log(newScores)
        this.setState({scores: data}, () => {
            console.log("Received score update", newScores)
        })
    }

    state = {
        playlistsForThisUser: [],
        selectedPlaylist: undefined,
        queue: [],
        volume: 0.05,
        startButtonVisible: true,
        muted: false,
        playing: false,
        played: 0,
        loaded: 0,
        started: false,
        currentTimer: null,
        ready: false,
        chatMessages: [],


        token1Correct: false,
        token2Correct: false,
        artistDisplay: "",
        songDisplay: "",
        scores: []
    }


    ref = player => {
        this.player = player
    }

    handleVolumeChange = e => {
        this.setState({volume: parseFloat(e.target.value)})
    }

    handlePause = () => {
        this.setState({playing: false})
    }
    handlePlay = () => {
        this.setState({playing: true})
    }

    handleReadyChange = () => {
        this.setState({ready: !this.state.ready})
    }

    handlePlayPause = () => {
        //console.log("Current timer")
        //console.log(this.state.currentTimer)

        //we are about to pause
        if (this.state.playing) {
            this.state.currentTimer.pause();
            //console.log("Remaining time ", this.state.currentTimer.getTimeLeft())
        } else {
            this.state.currentTimer.start();
        }
        //console.log("Emmiting playPause with play:", !this.state.playing)
        socket.emit("playPause", {
            playing: !this.state.playing,
            timer: this.state.currentTimer
        })


        this.setState({playing: !this.state.playing})


    }


    trackHandler = () => {
        // let currentSong = this.state.queue[0];
        // console.log(currentSong)
        //
        // this.setState({
        //     chatMessages: [...this.state.chatMessages,
        //         {
        //             "user": "CORRECT SONG",
        //             "message": currentSong['token1'] + " - " + currentSong['token2'],
        //             "guessedCount": 0
        //         }
        //     ]
        // }, () => {
        //
        // })

        this.state.queue.shift();
        //this.displaySongTitleAfterTime(currentSong['token1'] + " - " + currentSong['token2']);
        this.prepareNewTrack()

    }

    displaySongTitleAfterTime = () => {
        this.setState({token1Correct:true,token2Correct:true,
            currentTimer: new this.timer(this.prepareNewTrack, this.afterSongHintLength)}
        )
    }

    prepareNewTrack = () => {
        console.log("### PREP")
        console.log("Preparing new track")
        if (this.state.queue.length > 0) {
            console.log("Playing")
            console.log(this.state.queue[0])

            let token1 = this.state.queue[0]['token1']
            let token2 = this.state.queue[0]['token2']

            let blankTitleName = ""
            let blankArtistName = ""

            for (let i = 0; i < token1.length; i++) {
                if (token1[i] === ' ') {
                    blankArtistName += ' '
                } else {
                    blankArtistName += '_'
                }
            }

            for (let i = 0; i < token2.length; i++) {
                if (token2[i] === ' ') {
                    blankTitleName += ' '
                } else {
                    blankTitleName += '_'
                }
            }
            this.setState(
                {
                    currentTimer: new this.timer(this.trackHandler, this.songLength),
                    artistDisplay: blankArtistName,
                    songDisplay: blankTitleName,
                    token1Correct: false,
                    token2Correct: false
                }
            )
            console.log(`New song in ${this.songLength} ms`)
        } else {
            console.log("No more songs")
            this.setState({
                startButtonVisible: true, started: false, played: 0, artistDisplay: "",
                songDisplay: "", currentTimer: null
            })
        }

        this.handlePlay();
    }

    handleSkipToRandomPart = () => {
        let rand = this.state.queue[0]["startTimestamp"];
        this.player.seekTo(rand);
    }
    handleProgress = state => {
        this.setState(state)
    }

    handlePlaylistChange = (e) => {

        let playlistId = e.target.value;

        for (let playlist of this.state.playlistsForThisUser) {
            if (playlist.id === parseInt(playlistId)) {
                this.setState({selectedPlaylist: playlist}, () => {
                    //console.log("Selected playlist is now", this.state.selectedPlaylist)
                })
            }
        }


    }

    //called when we click start game
    prepareGame = () => {
        let {selectedPlaylist, playlistsForThisUser, started} = this.state;
        //console.log("CALLED START GAME, STARTED VARIABLE", started)
        if (started) {
            return;
        }
        //console.log("Playlists for this user [startGame]")
        // for (let playlist of playlistsForThisUser) {
        //     console.log(playlist)
        // }

        //console.log("NSP", selectedPlaylist)
        //console.log("PFTU[0]", playlistsForThisUser[0])

        let newSelectedPlaylist = selectedPlaylist === undefined ?
            playlistsForThisUser[0] : selectedPlaylist;

        console.log("NSP", newSelectedPlaylist)

        //console.log("NSP after", newSelectedPlaylist)

        if (newSelectedPlaylist === undefined) {
            return
        }
        for (let song of newSelectedPlaylist.songs) {
            song["startTimestamp"] = Math.random() * 0.7
        }

        newSelectedPlaylist.songs = newSelectedPlaylist.songs
            .map(value => ({value, sort: Math.random()}))
            .sort((a, b) => a.sort - b.sort)
            .map(({value}) => value)

        //console.log("NSP  [startGame]")
        // for (let song of newSelectedPlaylist.songs) {
        //     console.log(song.startTimestamp)
        // }

        let firstX = {
            creator_id: newSelectedPlaylist.creator_id,
            id : newSelectedPlaylist.id,
            name: newSelectedPlaylist.name,
            songs: []
        }

        for(let i = 0; i < Math.min(newSelectedPlaylist.songs.length, this.amountOfSongs); i++){
            firstX.songs.push(newSelectedPlaylist.songs[i]);
        }
        // if(newSelectedPlaylist.songs.length > this.amountOfSongs){
        //     firstX.songs = newSelectedPlaylist.songs.slice(0, this.amountOfSongs)
        // }
        // else{
        //     firstX.songs = newSelectedPlaylist.songs.slice(0, newSelectedPlaylist.songs.length)
        // }


        // console.log("NSPAFTER", newSelectedPlaylist)
        //
        // this.setState({
        //     queue = [...firstX.songs],
        //         startButtonVisible: false,
        //         started: true,
        //         selectedPlaylist: firstX
        //     }
        //     , () => {
        //         this.startGame();
        //
        //         socket.emit("startGame", {"source": this.decoded.id, "queue": firstX})
        //     })

        socket.emit("startGame",
            {"source": this.decoded.id, "queue": firstX}
        )

    }


    startGame = () => {
        this.prepareNewTrack();
    }

    handleMessageSend = function (message) {
        let {queue, token1Correct, token2Correct} = this.state;
        let song = queue[0]
        if (song) {
            var {token1, token2} = song
        }

        socket.emit("chatMessage", {
            "source": this.decoded.id,
            "username": this.decoded.username,
            "message": message,

            //we && with token1c and token2c so that only first guess is valid
            "token1": this.checkToken(token1, message) && !token1Correct,
            "token2": this.checkToken(token2, message) && !token2Correct,
            "tokenBoth": this.checkToken(token1 + " " + token2, message) && !token1Correct && !token2Correct
        })
    }.bind(this)

    checkToken = function (expected, message) {
        if (expected === undefined || message === undefined || expected === "undefined undefined") {
            return false
        }

        let noWhiteSpaceExpected = expected.replace(/\s+/g, '')
        let noWhiteSpaceMessage = message.replace(/\s+/g, '')


        let diff = this.fuzzball.token_set_ratio(expected, message)
        let noWhiteSpaceDiff = this.fuzzball.token_set_ratio(noWhiteSpaceExpected, noWhiteSpaceMessage)
        let res = (diff > 80 || noWhiteSpaceDiff > 80) && Math.abs(expected.length - message.length) < 5
        console.log(noWhiteSpaceExpected, " | ", noWhiteSpaceMessage)
        console.log(expected, " | ", message, res, diff, noWhiteSpaceDiff)
        return res

    }.bind(this)

    handleMessageReceived = (args) => {
        try{
            let {source, username, message, token1, token2, tokenBoth} = args;
            console.log("Received message from", source, username, message)
            console.log(token1, token2, tokenBoth)
            // if (source === this.decoded.id) {
            //     console.log("Ignoring message because I sent it")
            //     return;
            // }

            let {queue} = this.state;

            let {token1Correct, token2Correct} = this.state;

            let guessedCount = 0;
            if ((token1 && !token1Correct) || (tokenBoth && !token1Correct)) {
                guessedCount++;
                this.setState({token1Correct: true, artistDisplay: queue[0]['token1']})
            }
            if ((token2 && !token2Correct) || (tokenBoth && !token2Correct)) {
                guessedCount++;
                this.setState({token2Correct: true, songDisplay: queue[0]['token2']})
            }


            this.setState({
                chatMessages: [...this.state.chatMessages,
                    {
                        "user": username,
                        "message": message,
                        "guessedCount": guessedCount
                    }
                ]
            })
        }
        catch(err){
            console.log("Error error")
            console.log("~~~~~~~~~~~~~~~~")
            console.log(err)
            console.log("~~~~~~~~~~~~~~~~")
            console.log(args)
            console.log("~~~~~~~~~~~~~~~~")
        }



    }

    timer = function (callback, delay) {
        let id, startedTimer, remaining = delay, running

        this.start = function () {
            running = true
            startedTimer = new Date()
            id = setTimeout(callback, remaining)
        }

        this.pause = function () {
            running = false
            clearTimeout(id)
            remaining -= new Date() - startedTimer
        }

        this.getTimeLeft = function () {
            if (running) {
                this.pause()
                this.start()
            }

            return remaining
        }

        this.getStateRunning = function () {
            return running
        }

        this.start()
    }


    render() {
        const {
            volume, muted, playing, queue, played,
            ready, playlistsForThisUser, chatMessages, artistDisplay, songDisplay, scores, currentTimer,
            startButtonVisible
        } = this.state;
        let currentSongUrl = undefined
        if (queue.length > 0) {
            currentSongUrl = queue[0]["url"];
        }
        return (
            <div>
                <NavBar/>
                <ReactPlayer
                    ref={this.ref}
                    url={currentSongUrl}
                    volume={volume}
                    muted={muted}
                    playing={playing}
                    onStart={this.handleSkipToRandomPart}
                    onPlay={this.handlePlay}
                    onPause={this.handlePause}
                    width={0}
                    height={0}
                    onProgress={this.handleProgress}
                />

                <Center marginTop={"3%"}>
                    <HStack width={"90%"} alignItems={"start"}>
                        <VStack width={"30%"}>
                            <Text>Scores</Text>


                            <Table variant="simple" size={"sm"}>

                                    <Tbody>
                                        {scores.map(({score, username,}, index) => (
                                            <Tr key={index}>
                                                <Td>
                                                    <HStack fontWeight={"bold"}>
                                                        <Text color={"teal"}>
                                                            {username}
                                                        </Text>
                                                        <Text>
                                                            {":"}
                                                        </Text>
                                                        <Text>
                                                            {score}
                                                        </Text>
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>

                            </Table>

                        </VStack>

                        <VStack maxHeight="90%" width={"50%"}>

                            {!startButtonVisible && <HStack fontWeight={"bold"}>
                                <Text>
                                    {artistDisplay}
                                </Text>

                                <Text>
                                    {" - "}
                                </Text>

                                <Text>
                                    {songDisplay}
                                </Text>

                            </HStack>}

                            <Box overflowY="auto" maxHeight="320px" width={"100%"} display={"flex"}
                                 flexDirection={"column-reverse"}>
                                <Table variant="simple" size={"sm"}>
                                    <Tbody>
                                        {chatMessages.map(({user, message, guessedCount}, index) => (
                                            <Tr key={index}>
                                                <Td>
                                                    <HStack color={"blue"} fontWeight={"bold"}>
                                                        <Text color={"teal"}>
                                                            {user}
                                                        </Text>
                                                        <Text>
                                                            {":"}
                                                        </Text>
                                                        <Text color={guessedCount > 0 ? "orange" : "black"}>
                                                            {message}
                                                        </Text>
                                                    </HStack>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>

                            </Box>

                            <Input
                                type={"text"}
                                onKeyPress={(ev) => {
                                    if (ev.key === "Enter") {
                                        ev.preventDefault();
                                        if (ev.target.value.length > 0) {
                                            this.handleMessageSend(ev.target.value)
                                            ev.target.value = ""
                                        }

                                    }
                                }}
                            />


                            <HStack width={"100%"}>
                                <Input type='range' min={0} max={1} step='any' value={volume}
                                       onChange={this.handleVolumeChange}
                                       width={"20%"}/>
                                {/*<button onClick={this.handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>*/}
                                {
                                    ready ?
                                        <Button onClick={this.handleReadyChange}
                                                colorScheme={"red"}>{'Unready'}</Button>
                                        :
                                        <Button onClick={this.handleReadyChange} colorScheme={"blue"}>{'Ready'}</Button>
                                }


                                {startButtonVisible &&
                                <Button onClick={this.prepareGame}>{'Start Game'}</Button>}


                                {startButtonVisible &&
                                <Select width={"40%"} onChange={e => this.handlePlaylistChange(e)}>
                                    {
                                        playlistsForThisUser.map((playlist) => (
                                            <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                        ))
                                    }
                                </Select>
                                }


                            </HStack>

                            {!startButtonVisible && <Progress value={played * 100} width={"80%"}/>}
                            {!startButtonVisible && currentTimer !== null && <Progress value={100 - (currentTimer.getTimeLeft() / this.songLength) * 100} width={"80%"} colorScheme={"green"}/>}
                        </VStack>
                    </HStack>
                </Center>

            </div>
        )
    }
}

export default Room;
