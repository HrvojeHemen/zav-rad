import React, {Component} from "react";
import ReactPlayer from "react-player";
import NavBar from "./NavBar";
import {socket} from "./socket";
import {auth} from "./useTokenClass";
import {Navigate} from "react-router-dom";
import {
    Box, Button, Center, HStack, Input, Progress, Select, Table, Tbody, Td, Text, Tr, VStack
} from '@chakra-ui/react'
import jwt from "jsonwebtoken";
import {ArrowRightIcon, CheckIcon, CloseIcon} from "@chakra-ui/icons";

import readySound from "../sounds/readySound.wav";
import messageSound from "../sounds/messageSound.wav";


class Room extends Component {
    amountOfSongs = 10;
    decoded = jwt.decode(auth.token)
    songLength = 15000;
    allowedDistance = 5
    fuzzball = require('fuzzball');


    readyAudio = undefined
    messageAudio = undefined


    componentWillUnmount() {
        console.log("Unmounted")
        socket.emit("leaveRoom")
    }

    componentDidMount() {
        socket.off()
        socket
            .on("chatMessage", function (data) {
                this.handleMessageReceived(data);
            }.bind(this))

            .on("scoreBoardUpdate", function (data) {
                this.handleScoreBoardUpdate(data);
            }.bind(this))

            .on("playSong", function (data) {
                this.handlePlayFromServer(data)
            }.bind(this))

            .on("showTitle", function (data) {
                this.showTitle(data)
            }.bind(this))

            .on("quizDone", function () {
                this.quizDone()
            }.bind(this))
            .on("checkRoom", function (data) {
                console.log("Room name", data)


                //not in any socket room
                if (data === null || data === undefined) {
                    //check if query params have a roomName id to join that room if possible
                    let queryParams = new URLSearchParams(window.location.search);
                    let roomName = queryParams.get("roomName")

                    //if no params, redirect to /, otherwise join that room
                    if (roomName === null) {
                        this.setState({navigateToChooseRoom: true})
                    }

                    socket.emit("joinRoom", {
                        "roomName": roomName,
                        "userId": this.decoded.id,
                        "username": this.decoded.username
                    })

                }
            }.bind(this))
            .emit("checkRoom")

        this.readyAudio = this.makeAudio(readySound)
        this.messageAudio = this.makeAudio(messageSound)
        //console.log("Mounted")
        //console.log(this.decoded)
        fetch(process.env.REACT_APP_API_URL + "/playlist/user/" + this.decoded.id)
            .then(res => res.json())
            .then((result) => {
                //console.log("Playliste: ", result)
                this.setState({playlistsForThisUser: result})
            }, (error) => {
                console.log("Error in api fetch", error)
            })

        fetch(process.env.REACT_APP_API_URL + "/playlist/subscriptions/" + this.decoded.id)
            .then(res => res.json())
            .then((result) => {
                //console.log("Playliste: ", result)
                this.setState({playlistsForThisUser: [...this.state.playlistsForThisUser, ...result]})
            }, (error) => {
                console.log("Error in api fetch", error)
            })


    }

    quizDone = function () {
        this.setState({
            startButtonVisible: true, started: false, played: 0, artistDisplay: "",
            songDisplay: "", currentTimer: null, queue: []
        })
    }

    makeAudio = function (sound) {
        let audio = new Audio(sound)
        audio.volume = 0.04;
        return audio
    }

    playAudio(audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play()

    }

    handlePlayFromServer = function (song) {
        let token1 = song['token1']
        let token2 = song['token2']


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
        this.setState({
            artistDisplay: blankArtistName,
            songDisplay: blankTitleName,
            token1Correct: false,
            token2Correct: false,
            startButtonVisible: false,
            started: true,
            queue: [song],
            playing: true
        })
    }.bind(this)

    handleScoreBoardUpdate = function (data) {
        // console.log(newScores)

        console.log("RECEIVED ", data)
        this.setState({scores: data}, () => {
            // console.log("Received score update", newScores)
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
        scores: [],

        navigateToChooseRoom: false


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
        this.playAudio(this.readyAudio)
        this.setState({ready: !this.state.ready}, () => {
            console.log("Emmiting ready", this.state.ready)
            socket.emit("changeReady",
                {
                    "userId": this.decoded.id,
                    "ready": this.state.ready
                }
            )
        })
    }


    showTitle = (song) => {
        let {token1, token2} = song
        this.setState({
            token1Correct: true,
            token2Correct: true,
            artistDisplay: token1,
            songDisplay: token2
        })
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
                })
            }
        }


    }

    //called when we click start game
    prepareGame = () => {
        let {selectedPlaylist, playlistsForThisUser, started} = this.state;

        if (started) {
            return;
        }


        let newSelectedPlaylist = selectedPlaylist === undefined ? playlistsForThisUser[0] : selectedPlaylist;

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

        let firstX = {
            creator_id: newSelectedPlaylist.creator_id,
            id: newSelectedPlaylist.id,
            name: newSelectedPlaylist.name,
            songs: []
        }

        for (let i = 0; i < Math.min(newSelectedPlaylist.songs.length, this.amountOfSongs); i++) {
            firstX.songs.push(newSelectedPlaylist.songs[i]);
        }

        socket.emit("startGameServerHost", {
            "source": this.decoded.id, "queue": firstX
        })
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
            "token1": !token1Correct && this.checkToken(token1, message),
            "token2": !token2Correct && this.checkToken(token2, message),
            "tokenBoth": !token1Correct && !token2Correct && this.checkToken(token1 + " " + token2, message)
        })

    }.bind(this)

    checkToken = function (expected, message) {

        if (expected === undefined || message === undefined || expected === "undefined undefined") {
            return false
        }

        expected = expected.toString().toLowerCase()
        message = message.toString().toLowerCase()

        let noWhiteSpaceExpected = expected.replace(/\s+/g, '')
        let noWhiteSpaceMessage = message.replace(/\s+/g, '')

        let diff = this.fuzzball.token_set_ratio(expected, message)
        let noWhiteSpaceDiff = this.fuzzball.token_set_ratio(noWhiteSpaceExpected, noWhiteSpaceMessage)
        let res = (diff > 80 || noWhiteSpaceDiff > 80) && Math.abs(expected.length - message.length) < 5
        // console.log(noWhiteSpaceExpected, " | ", noWhiteSpaceMessage)
        // console.log(expected, " | ", message, res, diff, noWhiteSpaceDiff)
        return res

    }.bind(this)

    handleMessageReceived = (args) => {
        this.playAudio(this.messageAudio)
        try {
            let {username, message, token1, token2, tokenBoth, chatColor} = args;
            // console.log("Received message from", source, username, message)
            // console.log(token1, token2, tokenBoth)
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
                chatMessages: [...this.state.chatMessages, {
                    "user": username, "message": message, "guessedCount": guessedCount, "chatColor": chatColor
                }]
            })
        } catch (err) {
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
            volume,
            muted,
            playing,
            queue,
            played,
            ready,
            playlistsForThisUser,
            chatMessages,
            artistDisplay,
            songDisplay,
            scores,
            currentTimer,
            startButtonVisible,
            navigateToChooseRoom
        } = this.state;
        let currentSongUrl = undefined
        if (queue.length > 0) {
            currentSongUrl = queue[0]["url"];
        }
        if (navigateToChooseRoom) {
            return <Navigate to={"/"}/>
        }
        return (<div>
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

                    {/*SONG TITLE*/}
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

                        {/*CHAT*/}
                        <Box overflowY="auto" maxHeight="320px" width={"100%"} display={"flex"}
                             flexDirection={"column-reverse"}>
                            <Table variant="simple" size={"sm"}>
                                <Tbody>
                                    {chatMessages.map(({user, message, guessedCount, chatColor}, index) => (<Tr key={index}>
                                        <Td>
                                            <HStack color={"blue"} fontWeight={"bold"}>
                                                <Text color={chatColor}>
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
                                    </Tr>))}
                                </Tbody>
                            </Table>

                        </Box>

                        {/*CHAT INPUT*/}
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
                            {startButtonVisible ?
                                ready ? <Button onClick={this.handleReadyChange}
                                                colorScheme={"red"}>{'Unready'}</Button> :
                                    <Button onClick={this.handleReadyChange} colorScheme={"blue"}>{'Ready'}</Button>
                                : ""
                            }


                            {startButtonVisible && <Button onClick={this.prepareGame}>{'Start Game'}</Button>}


                            {startButtonVisible &&
                                <Select width={"40%"} onChange={e => this.handlePlaylistChange(e)}>
                                    {playlistsForThisUser.map((playlist) => (
                                        <option key={playlist.id} value={playlist.id}>{playlist.name}</option>))}
                                </Select>}


                        </HStack>

                        {!startButtonVisible && <Progress value={played * 100} width={"80%"}/>}
                        {!startButtonVisible && currentTimer !== null &&
                            <Progress value={100 - (currentTimer.getTimeLeft() / this.songLength) * 100}
                                      width={"80%"} colorScheme={"green"}/>}
                    </VStack>

                    <VStack width={"30%"}>
                        <Text>Scores</Text>


                        {/*SCOREBOARD*/}
                        <Table variant="simple" size={"sm"}>

                            <Tbody>
                                {scores.map(({score, username, ready, chatColor, skip,}, index) => (<Tr key={index}>
                                    <Td>
                                        <HStack fontWeight={"bold"}>
                                            {ready ? <CheckIcon/> : <CloseIcon/>}
                                            {skip ? <ArrowRightIcon/> : ""}

                                            <Text color={chatColor}>
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
                                </Tr>))}
                            </Tbody>

                        </Table>

                    </VStack>
                </HStack>
            </Center>

        </div>)
    }

}

export default Room;
