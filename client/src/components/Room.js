import React, {Component, useEffect, useState} from "react";
import ReactPlayer from "react-player";
import {io} from "socket.io-client"

import {socket} from "./socket";

class Room extends Component {

    constructor() {
        super();

        socket.on("playPause", function (data) {
            console.log("Received play:", data.playing)
            console.log("Data", data)
            if (data.playing !== this.state.playing) {
                console.log("Pausing from different source");
                this.handlePlayPause();
                //this.setState({currentTimer : data.timer})
            }
        }.bind(this))

        //when one in room starts the game others start it aswell
        .on("startGame", function (data) {
            console.log("Start variable in socket req reciever: ", this.state.started)
            if (!this.state.started) {
                this.startGame()
            }

        }.bind(this))
    }


    componentDidMount() {
        console.log("Mounted")
    }

    state = {
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
        console.log("Current timer")
        console.log(this.state.currentTimer)
        //we are about to pause
        if (this.state.playing) {
            this.state.currentTimer.pause();
            console.log("Remaining time ", this.state.currentTimer.getTimeLeft())
        } else {

            this.state.currentTimer.start();
        }
        console.log("Emmiting playPause with play:", !this.state.playing)
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
            this.setState({currentTimer: new this.timer(this.trackHandler, 4000)})
            console.log("in 4 sec new song")
        } else {
            console.log("no more songs");
        }

        this.handlePlay();
    }

    handleSkipToRandomPart = () => {
        let rand = this.state.queue[0]["startTimestamp"];
        console.log("Seeking to", rand)
        this.player.seekTo(rand);
    }
    handleProgress = state => {
        this.setState(state)
    }

    startGame = () => {

        if (this.state.started) {
            return;
        }

        let res;
        fetch("http://localhost:3000/playlist")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log(result)
                    res = result["songs"];
                },
                (error) => {
                    console.log("Error in api fetch", error)
                }
            ).then(
            () => {
                    console.log("State of this.started in StartGame", this.state.started)
                    this.setState({queue: res, startButtonVisible: false, started: true}, () => {
                        console.log("State of this.started after changing in StartGame", this.state.started)
                        console.log("Queue before preparing new track", this.state.queue)

                        this.prepareNewTrack();

                        socket.emit("startGame", this.state.queue)
                })
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
        const {volume, muted, playing, queue, played, loaded, started, ready} = this.state;
        let currentSongUrl = undefined
        if (queue.length > 0) {
            currentSongUrl = queue[0]["url"];
        }
        return (
            <div>
                <ReactPlayer
                    ref={this.ref}
                    url={currentSongUrl}
                    volume={volume}
                    muted={muted}
                    playing={playing}
                    onStart={this.handleSkipToRandomPart}
                    onPlay={this.handlePlay}
                    onPause={this.handlePause}
                    width={500}
                    height={400}
                    onProgress={this.handleProgress}
                />

                <input type='range' min={0} max={1} step='any' value={volume} onChange={this.handleVolumeChange}/>
                {/*<button onClick={this.handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>*/}

                <label>Ready<input
                    name="ready"
                    type="checkbox"
                    checked={ready}
                    onChange={this.handleReadyChange}
                /></label>


                <button onClick={this.handleSkipToRandomPart}>{'Random'}</button>
                <div>
                    {started ? <div>true</div> : <div>false</div>}
                </div>
                {this.state.startButtonVisible && <button onClick={this.startGame}>{'Start Game'}</button>}
                <br/>
                <progress max={1} value={played}/>
            </div>
        )
    }
}

export default Room;
