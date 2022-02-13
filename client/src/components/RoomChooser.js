import React, {Component, useEffect, useState} from "react";
import ReactPlayer from "react-player";
import {io} from "socket.io-client"
import {Navigate} from "react-router-dom";
import {socket} from "./socket";

class RoomChooser extends Component {
    constructor() {
        super();
    }

    componentDidMount() {
        console.log("Component did mount")
        // this.setState({
        //     socket: io(`http://${window.location.hostname}:3000`)
        // }, () => { console.log("Socket is: " + this.state.socket)})

    }

    state = {
        socket: null,
        userName: null,
        roomName: null,
        redirect : false
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let {roomName, userName} = this.state;
        if( userName === null ||
            userName.length === 0 ||
            roomName === null ||
            roomName.length ===0){
            alert("Please enter both Room name and user name")
        }
        socket.emit("joinRoom", roomName)
        this.setState({redirect:true})
        console.log("Entered: ",roomName," with username ",userName)

    }

    render(){
        const {redirect} = this.state;
        if(redirect){
            return <Navigate to={"/play"}/>
        }
        return (

            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>UserName:
                        <input type="text"
                               name={"userName"}
                               onChange={(e) => this.setState({userName: e.target.value})}
                        />
                    </label>
                    <br/>
                    <label>RoomName:
                        <input type="text"
                               name={"roomName"}
                               onChange={(e) => this.setState({roomName: e.target.value})}
                        />
                    </label>

                    <br/>
                    <input type="submit" />
                </form>


            </div>
        )
    }


}
export default RoomChooser;