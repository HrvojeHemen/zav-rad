import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Link,
    Button,
    Heading,
} from '@chakra-ui/react';
import axios from "axios";
import {auth} from "./useTokenClass";
import React, {Component} from "react";
import {Navigate} from "react-router-dom";

// https://chakra-templates.dev/forms/authentication

class Login extends Component {
    state = {
        userName: null,
        password: null,
        redirect: !!auth.token
    }

    handleSubmit = (event) => {
        event.preventDefault();

        let {userName, password} = this.state;

        axios.post(process.env.REACT_APP_API_URL + "/login",
            {
                "username": userName,
                "password": password
            }, {headers: {'Content-Type': undefined}})
            .then(r => {
                if (r.data.err) {
                    alert(r.data.err)
                } else {

                    let loginToken = r.data.token;
                    //console.log("Token", loginToken)
                    auth.saveToken(loginToken)
                    //console.log("Auth token", auth.token)

                    this.setState({redirect: true})
                }
            })
    }

    render() {
        const {redirect} = this.state;
        if (redirect) {
            return <Navigate to={"/choose-room"}/>
        }
        return (
            <Flex
                minH={'100vh'}
                align={'center'}
                justify={'center'}
                bg={'gray.50'}>
                <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                    <Stack align={'center'}>
                        <Heading fontSize={'4xl'}>Sign in to your account</Heading>
                    </Stack>
                    <Box
                        rounded={'lg'}
                        bg={'white'}
                        boxShadow={'lg'}
                        p={8}>
                        <form onSubmit={this.handleSubmit}>
                        <Stack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel htmlFor='userName'>User name</FormLabel>
                                <Input type="text"
                                       name={"userName"}
                                       required={true}
                                       autoComplete="on"
                                       onChange={(e) => this.setState({userName: e.target.value})}
                                />

                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel htmlFor='password'>Password</FormLabel>
                                <Input type="password"
                                       name={"password"}
                                       required={true}
                                       autoComplete="on"
                                       onChange={(e) => this.setState({password: e.target.value})}
                                />
                            </FormControl>
                            <Stack spacing={10}>
                                <Stack
                                    direction={{base: 'column', sm: 'row'}}
                                    align={'start'}
                                    justify={'space-between'}>
                                    <Link href={"/register"} color={'blue.400'}>Don't have an account?</Link>
                                </Stack>
                                <Button
                                    type={"submit"}
                                    bg={'blue.400'}
                                    color={'white'}
                                    _hover={{
                                        bg: 'blue.500',
                                    }}>
                                    Sign in
                                </Button>
                            </Stack>
                        </Stack>
                        </form>
                    </Box>
                </Stack>
            </Flex>
        );
    }
}

export default Login

