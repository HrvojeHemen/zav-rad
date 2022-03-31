import React, {Component} from "react";
import NavBar from "./NavBar";
import {auth} from "./useTokenClass";
import {Button, Center, Table, Tbody, Td, Text, Tr, VStack} from "@chakra-ui/react";
import jwt from "jsonwebtoken";
import {Navigate} from "react-router-dom";


class MyPlaylists extends Component {
    decoded = jwt.decode(auth.token)

    state = {
        playlists: [],
        redirectToPlaylistWithId: undefined,
        redirectToCreatePlaylist: false
    }

    componentDidMount() {

        fetch(process.env.REACT_APP_API_URL + "/playlist/user/" + this.decoded.id)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({playlists: result})
                },
                (error) => {
                    console.log("Error in api fetch", error)
                }
            )


    }

    redirectToCreate = () => {
        this.setState({redirectToCreatePlaylist:true})
    }

    setRedirectPlaylistId = function (id) {
        console.log("Idem na id", id)
        this.setState({redirectToPlaylistWithId: id})
    }.bind(this)


    render() {

        let {playlists, redirectToPlaylistWithId,  redirectToCreatePlaylist} = this.state;

        console.log(playlists)

        if (redirectToPlaylistWithId !== undefined) {
            return <Navigate to={"/edit-playlist/" + redirectToPlaylistWithId}/>
        }
        if (redirectToCreatePlaylist) {
            return <Navigate to={"/create-playlist"}/>
        }
        return (
            <div>
                <NavBar/>

                <Center>
                    <VStack>
                        <Button onClick={this.redirectToCreate} colorScheme={'blue'}> CREATE A PLAYLIST </Button>

                        <Text>Click on a playlist to edit it</Text>
                        <Table variant="simple" size={"sm"}>
                            <Tbody>
                                {playlists.map(({id, name, songs}, index) => (
                                    <Tr key={index}>
                                        <Td>
                                            <Button onClick={() => this.setRedirectPlaylistId(id)}>
                                                <Text>
                                                    {name}
                                                </Text>
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>

                    </VStack>

                </Center>
            </div>
        )
    }


}

export default MyPlaylists;