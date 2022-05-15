import React, {useEffect, useState} from "react";
import {
    Button,
    Center, HStack, Link,
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
import {useParams} from "react-router-dom";
import jwt from "jsonwebtoken";
import {auth} from "./useTokenClass";
import NavBar from "./NavBar";
import axios from "axios";

const ScoresViewer = () => {

    let decoded = jwt.decode(auth.token, undefined)

    const [loaded, setLoaded] = useState(false)

    const [scores, setScores] = useState([])

    const [valid, setValid] = useState(true)


    const {id} = useParams();


    useEffect(() => {
        if (loaded) return;
        setLoaded(true)
        fetch(process.env.REACT_APP_API_URL + "/stats/getByUserId/" + id)
            .then(res => res.json())
            .then(
                (result) => {

                    if (result === undefined || result === null) {
                        setValid(false)
                        return
                    }


                    setScores(result)
                },
                (error) => {
                    console.log("Error in api fetch", error)
                }
            )
    }, [loaded, id, decoded.id, scores])


    if (!valid) {
        return <Text>User with id={id} doesn't exist</Text>
    }


    return <div>
        <NavBar/>
        <Center>
            <VStack width={"50%"}>
                <Table variant="simple" size={"sm"} fontSize='sm'>
                    <TableCaption>Scores for this user</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>Playlist ID</Th>
                            <Th>Score</Th>
                            <Th>Playlist URL</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {
                            scores.map(({id, playlist_id, score}) => (
                                <Tr key={id}>
                                    <Td>
                                        <Text>{playlist_id}</Text>
                                    </Td>
                                    <Td>
                                        <Text>{score}</Text>
                                    </Td>

                                    <Td>
                                        <Link href={"/playlist/" + playlist_id}> Click me </Link>
                                    </Td>

                                </Tr>

                            ))

                        }

                    </Tbody>
                </Table>


            </VStack>
        </Center>
    </div>

}

export default ScoresViewer
