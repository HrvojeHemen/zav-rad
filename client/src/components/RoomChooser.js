import React, {Component} from "react";

import {Navigate} from "react-router-dom";
import {socket} from "./socket";
import NavBar from "./NavBar";
import {Button, Center, FormControl, FormLabel, Input} from "@chakra-ui/react";
import {auth} from "./useTokenClass";
import jwt from "jsonwebtoken";
class RoomChooser extends Component {
    decoded = jwt.decode(auth.token)

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
        socket.emit("joinRoom", {"roomName": roomName, "userId":this.decoded.id, "username": this.decoded.username })
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
                <Center>
                <form onSubmit={this.handleSubmit}>
                    <FormControl isRequired>
                        <FormLabel htmlFor='roomName'>Room Name</FormLabel>
                        <Input type="text"
                               name={"roomName"}
                               onChange={(e) => this.setState({roomName: e.target.value})}
                        />
                    </FormControl>

                    <br/>
                    <Button type="submit" colorScheme='blue'>JOIN</Button>
                </form>
                </Center>

            </div>
        )
    }


}
export default RoomChooser;