import React, {Component} from "react";

import {Navigate} from "react-router-dom";
import {socket} from "./socket";
import NavBar from "./NavBar";

class RoomChooser extends Component {

    componentDidMount() {
        console.log("Component did mount")
    }

    state = {
        roomName: null,
        redirect : false
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let {roomName} = this.state;
        if(
            roomName === null ||
            roomName.length === 0){
            alert("Please enter both Room name and user name")
        }
        socket.emit("joinRoom", roomName)
        this.setState({redirect:true})
        console.log("Entered: ",roomName)

    }

    render(){
        const {redirect} = this.state;
        if(redirect){
            return <Navigate to={"/play"}/>
        }
        return (

            <div>
                <NavBar />
                <form onSubmit={this.handleSubmit}>
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