import React, {useEffect, useState} from "react";
import {
    Button,
    ButtonGroup,
    Center,
    IconButton,
    Input,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    PopoverTrigger,
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
import {Navigate} from "react-router-dom";
import {useParams} from "react-router-dom";
import jwt from "jsonwebtoken";
import {auth} from "./useTokenClass";
import NavBar from "./NavBar";
import {CheckIcon, DeleteIcon} from "@chakra-ui/icons";
import axios from "axios";


const EditPlaylist = () => {
    let decoded = jwt.decode(auth.token)
    const [loaded, setLoaded] = useState(false)
    const [allowed, setAllowed] = useState(true)
    const [owner, setOwner] = useState(undefined)
    const [songs, setSongs] = useState([])
    const [valid, setValid] = useState(true)

    const [redirect, setRedirect] = useState(false);

    const {id} = useParams();

    // console.log(id)


    useEffect(() => {
        if (!loaded) {
            setLoaded(true)
            fetch(process.env.REACT_APP_API_URL + "/playlist/byId/" + id)
                .then(res => res.json())
                .then(
                    (result) => {

                        if (result === undefined || result === null) {
                            setValid(false)
                            return
                        }
                        // console.log(result)
                        // console.log(result['creator_id'], decoded.id)

                        setOwner(result['creator']['username'])
                        if (parseInt(result['creator_id']) !== parseInt(decoded.id)) {
                            setAllowed(false)
                            return
                        }

                        setSongs(result['songs'])


                    },
                    (error) => {
                        console.log("Error in api fetch", error)
                    }
                )
        }
    }, [loaded, id, decoded.id, owner])


    if (!valid) {
        return <Text>Playlist with id={id} doesn't exist</Text>
    }
    if (!allowed) {
        return <Text>You don't have permissions to access this playlist, it's owned by "{owner}"</Text>
    }

    const deleteSong = (id) => {
        axios.post(process.env.REACT_APP_API_URL + "/playlist/editSong/" + id,
            {
                del: true,
                id: id
            }, {headers: {'Content-Type': undefined}})
            .then(r => {
                if (r.data.err) {
                    alert(r.data.err)
                } else {


                    setSongs(songs.filter(song => song.id !== id))
                }
            })
    }

    const updateSong = (id) => {
        try {
            let theSong = songs.filter(song => song.id === id)[0];
            // console.log("Updateam pjesmu", theSong)
            axios.post(process.env.REACT_APP_API_URL + "/playlist/editSong/" + id,
                {
                    del: false,
                    id: id,
                    url: theSong['url'],
                    token1: theSong['token1'],
                    token2: theSong['token2']
                }, {headers: {'Content-Type': undefined}})
                .then(r => {
                    if (r.data.err) {
                        console.log("Error in update send request", r.data.err)
                    }
                })
        } catch (err) {
            console.log("Error in saving updated song", err)
        }

    }

    const handleUrlChange = (newUrl, id) => {
        try {
            songs.filter(song => song.id === id)[0]['url'] = newUrl
        } catch (err) {
            console.log("Error in altering song", err)
        }


    }

    const handleToken1Change = (newToken1, id) => {
        try {
            songs.filter(song => song.id === id)[0]['token1'] = newToken1
        } catch (err) {
            console.log("Error in altering song", err)
        }
    }
    const handleToken2Change = (newToken2, id) => {
        try {
            songs.filter(song => song.id === id)[0]['token2'] = newToken2
        } catch (err) {
            console.log("Error in altering song", err)
        }
    }

    const deletePlaylist = () => {
        console.log("DELETEAM")
        axios.post(process.env.REACT_APP_API_URL + "/playlist/delete/" + decoded.id + "/" + id)
            .then(() => {
                console.log("NAVIGIRAM")
                setRedirect(true)

            })
    }

    if (redirect) return <Navigate to={'/my-playlists'}/>
    else
        return <div>
            <NavBar/>
            <Center>
                <VStack width={"100%"}>
                    <Table variant="simple" size={"sm"} fontSize='sm'>
                        <TableCaption>Edit the songs as needed</TableCaption>
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
                                        <Input type={'text'}
                                               defaultValue={url}
                                               onChange={(e) => handleUrlChange(e.target.value, id)}
                                        />
                                    </Td>
                                    <Td>
                                        <Input type={'text'} defaultValue={token1}
                                               onChange={(e) => handleToken1Change(e.target.value, id)}/>
                                    </Td>
                                    <Td>
                                        <Input type={'text'} defaultValue={token2}
                                               onChange={(e) => handleToken2Change(e.target.value, id)}/>
                                    </Td>

                                    <Td>
                                        <IconButton
                                            colorScheme={'green'}
                                            icon={<CheckIcon/>}
                                            aria-label={'Save-Item'}
                                            onClick={() => {
                                                updateSong(id)
                                            }}
                                        />
                                        <IconButton
                                            colorScheme={'red'}
                                            icon={<DeleteIcon/>}
                                            aria-label={'Delete-Item'}
                                            onClick={() => {
                                                deleteSong(id)
                                            }}
                                        />
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>


                    <Popover
                        returnFocusOnClose={false}
                        placement='right'
                        closeOnBlur={false}
                    >
                        <PopoverTrigger>
                            <Button colorScheme={'red'}>Delete this playlist</Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverHeader fontWeight='semibold'>Confirmation</PopoverHeader>
                            <PopoverArrow/>
                            <PopoverCloseButton/>
                            <PopoverBody>
                                Are you sure you want to delete this playlist?
                            </PopoverBody>
                            <PopoverFooter d='flex' justifyContent='flex-end'>
                                <ButtonGroup size='sm'>
                                    <Button colorScheme='red' onClick={deletePlaylist}>Confirm</Button>
                                </ButtonGroup>
                            </PopoverFooter>
                        </PopoverContent>
                    </Popover>
                </VStack>
            </Center>
        </div>

}

export default EditPlaylist
