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
import * as PropTypes from "prop-types";


class Room extends Component {
    decoded = jwt.decode(auth.token)
    songLength = 12000;
    // 1 / allowedDistance, 5 -> 20% mistake allowed
    allowedDistance = 5
    fuzzball = require('fuzzball');


    componentDidMount() {
        //console.log("Mounted")
        //console.log(this.decoded)
        fetch("http://localhost:3000/playlist/user/" + this.decoded.id)
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
                let source = data['source']
                let queue = data['queue']
                //console.log("Data received:", data)
                //console.log("this.decoded in socket", this.decoded)
                if (source === this.decoded.id) {
                    console.log("Start from same source, ignoring it")
                    return
                }
                //console.log(this.state)
                //console.log("Start variable in socket req reciever: ", this.state.started)
                if (!this.state.started) {

                    this.setState({queue: [...queue], startButtonVisible: false, started: true}
                        , () => {
                            this.startGame();
                        })
                }

            }.bind(this))

            .on("chatMessage", function (data) {
                this.handleMessageReceived(data);
            }.bind(this))

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
        songDisplay: ""
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
        this.state.queue.shift();
        this.prepareNewTrack();
    }

    prepareNewTrack = () => {
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
                songDisplay: ""
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


        this.setState({
                queue: [...newSelectedPlaylist.songs],
                startButtonVisible: false,
                started: true,
                selectedPlaylist: newSelectedPlaylist
            }
            , () => {
                //console.log("State of this.started after changing in StartGame", this.state.started)
                //console.log("Queue before preparing new track", this.state.queue)
                //console.log("Current selected playlist", this.state.selectedPlaylist)


                this.startGame();

                socket.emit("startGame", {"source": this.decoded.id, "queue": this.state.queue})
            })

    }


    startGame = () => {
        this.prepareNewTrack();
    }

    handleMessageSend = function (message) {
        let {queue} = this.state;
        let song = queue[0]
        if(song){
            var {token1, token2} = song
        }

        socket.emit("chatMessage", {
            "source": this.decoded.id,
            "username": this.decoded.username,
            "message": message,
            "token1": this.checkToken(token1, message),
            "token2": this.checkToken(token2, message),
            "tokenBoth": this.checkToken(token1 + " " + token2, message)
        })
    }.bind(this)

    checkToken = function (expected, message) {
        if (expected === undefined || message === undefined || expected === "undefined undefined") {
            return false
        }

        let diff = this.fuzzball.token_set_ratio(expected, message)
        let res = diff > 80 && Math.abs(expected.length - message.length) < 5
        console.log(expected," | " ,message, res, diff)
        return res

    }.bind(this)


    handleMessageReceived = (args) => {
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
        if((token1 && !token1Correct) || (tokenBoth && !token1Correct)){
            guessedCount++;
            this.setState({token1Correct: true, artistDisplay: queue[0]['token1']})
        }
        if((token2 && !token2Correct) || (tokenBoth && !token2Correct)){
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
            volume, muted, playing, queue, played, started,
            ready, playlistsForThisUser, chatMessages, artistDisplay, songDisplay
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

                <Center>
                    <VStack maxHeight="90%" width={"50%"}>

                        <HStack fontWeight={"bold"}>
                            <Text>
                                {artistDisplay}
                            </Text>

                            <Text>
                                {playing && " - "}
                            </Text>

                            <Text>
                                {songDisplay}
                            </Text>

                        </HStack>

                        <Box overflowY="auto" maxHeight="320px" width={"100%"} display={"flex"}
                             flexDirection={"column-reverse"}>
                            <Table variant="simple" size={"sm"}>
                                <Tbody>
                                    {chatMessages.map(({user, message, guessedCount}) => (
                                        <Tr>
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
                                    <Button onClick={this.handleReadyChange} colorScheme={"red"}>{'Unready'}</Button>
                                    :
                                    <Button onClick={this.handleReadyChange} colorScheme={"blue"}>{'Ready'}</Button>
                            }


                            {this.state.startButtonVisible &&
                            <Button onClick={this.prepareGame}>{'Start Game'}</Button>}


                            {this.state.startButtonVisible &&
                            <Select width={"40%"} onChange={e => this.handlePlaylistChange(e)}>
                                {playlistsForThisUser.map((playlist) => (
                                    <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                ))}
                            </Select>
                            }


                        </HStack>

                        <Progress value={played * 100} width={"80%"}/>
                    </VStack>
                </Center>

            </div>
        )
    }
}

export default Room;
