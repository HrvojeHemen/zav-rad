import React, {useEffect, useState} from "react";
import {
    Button,
    Center, HStack,
    Table,
    TableCaption,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react";
import {Navigate, useParams} from "react-router-dom";
import jwt from "jsonwebtoken";
import {auth} from "./useTokenClass";
import NavBar from "./NavBar";
import axios from "axios";

const PlaylistViewer = () => {

    let decoded = jwt.decode(auth.token, undefined)

    const [loaded, setLoaded] = useState(false)
    //allowed ? ownedByUs : ownedBySomeoneElse

    const [allowed, setAllowed] = useState(true)

    const [owner, setOwner] = useState(undefined)

    const [songs, setSongs] = useState([])

    const [valid, setValid] = useState(true)

    const [subscribed, setSubscribed] = useState(false)

    const {id} = useParams();


    let changeSubscriptionStatus = () => {
        console.log(decoded.id, id)
        if(subscribed){
            axios.post(process.env.REACT_APP_API_URL + "/playlist/unsubscribe/" + decoded.id + "/" + id).then(r => console.log("UNSUBSCRIBED",r))
        }
        else{
            axios.post(process.env.REACT_APP_API_URL + "/playlist/subscribe/" + decoded.id + "/" + id).then(r => console.log("SUBSCRIBED",r))
        }


        setSubscribed(!subscribed)
    }

    let importPlaylist = () => {
        axios.post(process.env.REACT_APP_API_URL + "/playlist/import/" + decoded.id + "/" + id).then(r => console.log("Imported",r))

    }

    useEffect(() => {

        if (loaded) return;
        setLoaded(true)
        fetch(process.env.REACT_APP_API_URL + "/playlist/byId/" + id)
            .then(res => res.json())
            .then(
                (result) => {

                    if (result === undefined || result === null) {
                        setValid(false)
                        return
                    }


                    setOwner(result['creator']['username'])
                    if (parseInt(result['creator_id']) !== parseInt(decoded.id)) {
                        setAllowed(false)
                    }

                    setSongs(result['songs'])


                },
                (error) => {
                    console.log("Error in api fetch", error)
                }
            )

        fetch(process.env.REACT_APP_API_URL + "/playlist/subscription/" + decoded.id + "/" + id)
            .then(res => res.json())
            .then((result) => {
                setSubscribed(result.status)
            })
    }, [loaded, id, decoded.id, owner, subscribed])


    if (!valid) {
        return <Text>Playlist with id={id} doesn't exist</Text>
    }
    if(allowed){
        return <Navigate to={"/edit-playlist/" + id}/>
    }


    return <div>
        <NavBar/>
        <Center>
            <VStack width={"100%"}>
                <Table variant="simple" size={"sm"} fontSize='sm'>
                    <TableCaption>Songs from this playlist</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Url</Th>
                            <Th>Artist name</Th>
                            <Th>Song name</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {songs.map(({id, url, token1, token2}) => (
                            <Tr key={id}>
                                <Td>
                                    <Text>{url}</Text>
                                </Td>
                                <Td>
                                    <Text>{token1}</Text>
                                </Td>
                                <Td>
                                    <Text>{token2}</Text>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>

                <HStack>
                    {allowed ? "" : <Button colorScheme={'blue'} onClick={importPlaylist}>Import</Button>}
                    {allowed ? "" : <Button colorScheme={subscribed ? "red" : "green"}
                                            onClick={changeSubscriptionStatus}>
                        {subscribed ? "Unsubscribe" : "Subscribe"}</Button>}
                </HStack>

            </VStack>
        </Center>
    </div>

}

export default PlaylistViewer
