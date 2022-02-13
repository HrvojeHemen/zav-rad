// import React, {Component} from "react";
// import PropTypes from "prop-types";
// import ReactPlayer from "react-player";
//
// class YoutubeEmbed extends Component {
//
//
//
//     state = {
//         queue : ["https://www.youtube.com/watch?v=NhUFs3oqGlw","https://www.youtube.com/watch?v=syFZfO_wfMQ", "https://www.youtube.com/watch?v=W-TE_Ys4iwM","https://www.youtube.com/watch?v=_kqQDCxRCzM"],
//         volume: 0.3,
//         muted : false,
//         playing : false,
//         played: 0,
//         loaded: 0,
//         currentTimer: null
//     }
//
//     ref = player => {
//         this.player = player
//     }
//
//     handleVolumeChange = e => {
//         this.setState({ volume: parseFloat(e.target.value) })
//     }
//
//     handlePause = () =>{
//         this.setState({ playing: false })
//     }
//     handlePlay = () => {
//         this.setState({ playing: true })
//     }
//
//     handlePlayPause = () =>{
//         //we are about to pause
//         if(this.state.playing){
//             this.state.currentTimer.pause();
//             console.log(this.state.currentTimer.getTimeLeft())
//         }
//         else{
//             this.state.currentTimer.start();
//         }
//
//         this.setState({playing: !this.state.playing})
//     }
//
//
//     trackHandler = () =>{
//         this.state.queue.shift();
//         this.handlePlay();
//         this.prepareNewTrack();
//     }
//
//     prepareNewTrack = () =>{
//         console.log("Preparing new track")
//         if(this.state.queue.length > 0){
//             this.state.currentTimer = new this.timer(this.trackHandler, 4000);
//             console.log("in 4 sec new song")
//         }
//         else{
//             console.log("no more songs");
//         }
//
//         this.handlePlay();
//     }
//
//     handleSkipToRandomPart = () => {
//         let rand = Math.random() * 0.7;
//         this.player.seekTo(rand);
//     }
//     handleProgress = state => {
//         this.setState(state)
//     }
//
//     startGame = () => {
//         this.prepareNewTrack();
//         this.handlePlay();
//     }
//
//     timer = function(callback, delay) {
//         var id, started, remaining = delay, running
//
//         this.start = function() {
//             running = true
//             started = new Date()
//             id = setTimeout(callback, remaining)
//         }
//
//         this.pause = function() {
//             running = false
//             clearTimeout(id)
//             remaining -= new Date() - started
//         }
//
//         this.getTimeLeft = function() {
//             if (running) {
//                 this.pause()
//                 this.start()
//             }
//
//             return remaining
//         }
//
//         this.getStateRunning = function() {
//             return running
//         }
//
//         this.start()
//     }
//
//
//
//     render() {
//         const {volume, muted, playing, queue, played, loaded} = this.state;
//
//         return (
//             <div>
//                 <ReactPlayer
//                     ref={this.ref}
//                     url={queue[0]}
//                     volume={volume}
//                     muted={muted}
//                     playing={playing}
//                     onStart={this.handleSkipToRandomPart}
//                     onPlay={this.handlePlay}
//                     onPause={this.handlePause}
//                     width={500}
//                     height={400}
//                     onProgress={this.handleProgress}
//                 />
//
//                 <input type='range' min={0} max={1} step='any' value={volume} onChange={this.handleVolumeChange} />
//                 <button onClick={this.handlePlayPause}>{playing ? 'Pause' : 'Play'}</button>
//                 <button onClick={this.handleSkipToRandomPart}>{'Random'}</button>
//                 <button onClick={this.startGame}>{'Start Game'}</button>
//                 <br/>
//                 <progress max={1} value={played} />
//             </div>
//         )
//     }
//
//
// }
//
//
//
// export default YoutubeEmbed;