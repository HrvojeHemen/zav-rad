import jwt from "jsonwebtoken";
import {auth} from "./useTokenClass";
import {Navigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    Box,
    Center, Divider, Heading,
    HStack,
    IconButton,
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
import axios from "axios";
import {DeleteIcon} from "@chakra-ui/icons";
import NavBar from "./NavBar";

const AdminDashboard = () => {
    let decoded = jwt.decode(auth.token, undefined)


    const [loaded, setLoaded] = useState(false)
    const [allUsers, setAllUsers] = useState([]);
    useEffect(() => {
        if (loaded) return;
        setLoaded(true)


        loadUsers()

    }, [loaded, allUsers])

    let loadUsers = () => {
        fetch(process.env.REACT_APP_API_URL + "/users/getAll")
            .then(res => res.json())
            .then((res) => {
                if (res === undefined || res === null) {
                    return "ERROR WHEN GETTING ALL USERS"
                }
                console.log(res)

                let currentUsers = []
                for (let user of res) {
                    let {id, role, username, mail, password} = user
                    console.log(password)
                    currentUsers.push({'id': id, "role": role, "username": username, "mail": mail})
                }

                setAllUsers(currentUsers)
            })

    }


    // console.log(decoded)


    let deleteUser = (id) => {
        axios.post(process.env.REACT_APP_API_URL + "/users/delete/" + id)
            .then(() => {
                loadUsers()
            })
    }

    //trusted ids
    if ([
        //justi1337
        0

    ].filter(id => id === decoded.id).length === 0) return <Navigate to={"/"}/>


    return <Center>


        <VStack height={"80%"} width={"60%"} >
            <NavBar/>
            <Heading>Admin Dashboard</Heading>
            <Divider/>
            <Box overflowY="auto" width={"100%"} >
                <Table variant="simple" size={"sm"} >
                    <TableCaption>All users</TableCaption>
                    <Thead>
                        <Tr>
                            <Th>ID</Th>
                            <Th>ROLE</Th>
                            <Th>USERNAME</Th>
                            <Th>MAIL</Th>
                            <Th>DELETE USER</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {allUsers.map(({id, role, username, mail, password}, index) => (
                            <Tr key={index}>
                                <Td>{id}</Td>
                                <Td>{role}</Td>
                                <Td>{username}</Td>
                                <Td>{mail}</Td>
                                <Td>
                                    <IconButton
                                        colorScheme={'red'}
                                        icon={<DeleteIcon/>}
                                        aria-label={'Delete-User'}
                                        onClick={() => {
                                            deleteUser(id)
                                        }}
                                    />
                                </Td>
                            </Tr>))}
                    </Tbody>
                </Table>

            </Box>
        </VStack>
    </Center>
}

export default AdminDashboard;