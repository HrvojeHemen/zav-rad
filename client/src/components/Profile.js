import React, {Component} from "react";
import NavBar from "./NavBar";
import {auth} from "./useTokenClass";
import {
    Box,
    Button,
    Center,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Link,
    Stack,
    Text,
    VStack
} from "@chakra-ui/react";
import {Navigate} from "react-router-dom";
import jwt, {decode} from "jsonwebtoken";
import {CheckIcon} from "@chakra-ui/icons";
import axios from "axios";


class Profile extends Component {
    decoded = jwt.decode(auth.token)
    state = {
        logoutRedirect: false,
        playlistsRedirect: false,
        userParams: {id: undefined, mail: undefined, name: undefined}
    }

    logout = function () {
        auth.deleteToken()
        this.setState({logoutRedirect: true})
    }.bind(this)

    redirectToPlaylists = function () {
        this.setState({playlistsRedirect: true})
    }.bind(this)


    componentDidMount() {

        fetch(process.env.REACT_APP_API_URL + "/users/byId/" + this.decoded.id)
            .then(res => res.json())
            .then((res) => {
                if (res === undefined || res === null) {
                    return "ERROR WHEN GETTING ALL USERS"
                }
                this.setState({userParams: res[0]}, () => {
                    console.log("SEtting user params")
                    console.log(this.state.userParams)

                })

            })

    }
    saveChanges = function() {
        try {
            let {id,username,mail} = this.state.userParams;
            console.log(id,username,mail)
            axios.post(process.env.REACT_APP_API_URL + "/users/update",
                {
                    id: id,
                    username: username,
                    mail: mail
                })
                .then(r => {
                    if (r.data.err) {
                        console.log("Error in update send request", r.data.err)
                    }
                })
        } catch (err) {
            console.log("Error in saving updated song", err)
        }
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
            <Center>
                <VStack>
                    <NavBar/>
                    <HStack>
                        <Box
                            rounded={'lg'}
                            bg={'white'}
                            boxShadow={'lg'}
                            p={4}>
                            <form onSubmit={this.handleSubmit}>
                                <Stack spacing={1} align={"center"}>
                                    <FormLabel htmlFor='userName'>User name</FormLabel>
                                    <Input type="text"
                                           name={"userName"}
                                           required={true}
                                           autoComplete="on"
                                           onChange={(e) => this.setState(
                                               prevState => ({
                                                   userParams: {
                                                       ...prevState.userParams,
                                                       username: e.target.value
                                                   }

                                               }))}
                                           defaultValue={this.state.userParams.username}

                                    />
                                    <FormLabel htmlFor='mail'>mail</FormLabel>
                                    <Input type="text"
                                           name={"mail"}
                                           required={true}
                                           autoComplete="on"
                                           onChange={(e) => this.setState(
                                               prevState => ({
                                                   userParams: {
                                                       ...prevState.userParams,
                                                       mail: e.target.value
                                                   }

                                               }))}
                                           defaultValue={this.state.userParams.mail}
                                    />

                                    <Button colorScheme={"teal"} onClick={() => {this.saveChanges()}}>Save changes</Button>
                                </Stack>

                            </form>

                        </Box>


                    </HStack>

                    <HStack>
                        <Button colorScheme={'red'} onClick={this.logout}>LOG OUT</Button>

                        <Button colorScheme={'blue'} onClick={this.redirectToPlaylists}>MY PLAYLISTS</Button>
                    </HStack>


                </VStack>

            </Center>
        )
    }


}

export default Profile;