import React, {Component} from "react";
import NavBar from "./NavBar";
import {auth} from "./useTokenClass";
import {Button, Center} from "@chakra-ui/react";
import {Navigate} from "react-router-dom";
import jwt from "jsonwebtoken";


class Profile extends Component {
    decoded = jwt.decode(auth.token)

    state = {
        logoutRedirect: false,
        playlistsRedirect: false
    }

    logout = function () {
        auth.deleteToken()
        this.setState({logoutRedirect: true})
    }.bind(this)

    redirectToPlaylists = function() {
        this.setState({playlistsRedirect:true})
    }.bind(this)



    render() {

        const {logoutRedirect, playlistsRedirect} = this.state;
        if (logoutRedirect) {
            return <Navigate to={"/"}/>
        }

        if (playlistsRedirect) {
            return <Navigate to={"/my-playlists"}/>
        }

        return (
            <div>
                <NavBar/>

                <Center>


                    <Button colorScheme={'red'} onClick={this.logout}>LOG OUT</Button>

                    <Button colorScheme={'blue'} onClick={this.redirectToPlaylists} >MY PLAYLISTS</Button>

                </Center>
            </div>
        )
    }


}

export default Profile;