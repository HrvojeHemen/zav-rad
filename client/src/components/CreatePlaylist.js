import React, {Component} from "react";
import axios from "axios";
import NavBar from "./NavBar";
import {auth} from "./useTokenClass";
import jwt from "jsonwebtoken"
import {
    Button,
    Center,
    FormControl,
    FormLabel,
    Heading,
    HStack,
    Input,
    Link,
    Text,
    Textarea,
    VStack
} from "@chakra-ui/react";
import {Navigate} from "react-router-dom";

class CreatePlaylist extends Component {

    state = {
        name: null,
        url: null,
        redirect: false,
        playlistUrl: ""
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let {name, url} = this.state;
        let decoded = jwt.decode(auth.token)


        axios.post(process.env.REACT_APP_API_URL + "/playlist",
            {
                "playlistName": name,
                "url": url,
                "creatorId": decoded.id
            }, {headers: {'Content-Type': undefined}})
            .then(r => {
                if (r.data.err) {
                    alert(r.data.err)
                } else {
                    console.log("Created playlist successfully")
                    console.log(r.data)

                    this.setState(
                        {playlistUrl: "/edit-playlist/" + r.data.id, redirect: true}
                    )
                }
            })
    }

    render() {
        if (this.state.redirect) {
            return <Navigate to={this.state.playlistUrl}/>
        }
        return (

            <div>
                <NavBar/>

                <Center>
                    <VStack>
                        <Heading>Create a playlist</Heading>
                        <form onSubmit={this.handleSubmit}>
                            <FormControl isRequired>
                                <FormLabel htmlFor='userName'>Playlist Name:</FormLabel>
                                <Input type="text"
                                       name={"name"}
                                       onChange={(e) => this.setState({name: e.target.value})}
                                />
                            </FormControl>

                            <HStack>

                                <Text>Youtube playlist ID:</Text>
                                <Link color={'blue'} isExternal={true}
                                      href={'https://www.sociablekit.com/find-youtube-playlist-id/#:~:text=Go%20to%20your%20target%20YouTube,playlist%20ID%20is%20PLFs4vir_WsTwEd%2DnJgVJCZPNL3HALHHpF'}>
                                    How to get playlist id
                                </Link>
                            </HStack>

                            <Textarea
                                rows={1}
                                cols={50}
                                name={"urls"}
                                required={true}
                                onChange={(e) => this.setState({url: e.target.value})}
                            />

                            <br/>
                            <Button type="submit" colorScheme='blue' margin={"5px 0"}>CREATE PLAYLIST</Button>

                        </form>
                    </VStack>

                </Center>

            </div>
        )
    }


}

export default CreatePlaylist;