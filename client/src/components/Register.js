import React, {Component} from "react";
import axios from "axios";
import {Navigate} from "react-router-dom";
import {auth} from "./useTokenClass";
import {Box, Button, Flex, FormControl, FormLabel, Heading, Input, Link, Stack} from "@chakra-ui/react";

class Register extends Component {

    state = {
        mail: null,
        userName: null,
        password: null,
        password2: null,
        redirect: !!auth.token
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let {mail, userName, password, password2} = this.state;
        if (password !== password2) {
            alert("Passwords don't match")
            return
        }

        axios.post(process.env.REACT_APP_API_URL + "/register",
            {
                "mail": mail,
                "username": userName,
                "password": password
            }, {headers:  {'Content-Type': undefined} })
            .then(r => {
                if (r.data.err) {
                    alert(r.data.err)
                } else {
                    this.setState({redirect: true})
                }
            })

    }

    render() {

        const {redirect} = this.state;
        if (redirect) {
            return <Navigate to={"/login"}/>
        }

        return (


            <Flex
                minH={'100vh'}
                align={'center'}
                justify={'center'}
                bg={'gray.50'}>
                <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                    <Stack align={'center'}>
                        <Heading fontSize={'4xl'}>Create an account</Heading>
                    </Stack>
                    <Box
                        rounded={'lg'}
                        bg={'white'}
                        boxShadow={'lg'}
                        p={8}>
                    <form onSubmit={this.handleSubmit}>

                        <FormControl isRequired>
                            <FormLabel htmlFor='userName'>User name</FormLabel>
                            <Input type="text"
                                   name={"userName"}
                                   required={true}
                                   onChange={(e) => this.setState({userName: e.target.value})}
                            />

                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel htmlFor='email'>E-mail</FormLabel>
                            <Input type="email"
                                   name={"mail"}
                                   required={true}
                                   onChange={(e) => this.setState({mail: e.target.value})}
                            />
                        </FormControl>


                        <FormControl isRequired>
                            <FormLabel htmlFor='password'>Password</FormLabel>
                            <Input type="password"
                                   name={"password"}
                                   required={true}
                                   onChange={(e) => this.setState({password: e.target.value})}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel htmlFor='password2'>Confirm password</FormLabel>
                            <Input type="password"
                                   name={"password2"}
                                   required={true}
                                   onChange={(e) => this.setState({password2: e.target.value})}
                            />
                        </FormControl>

                        <Stack spacing={10}>
                            <Stack
                                direction={{base: 'column', sm: 'row'}}
                                align={'start'}
                                justify={'space-between'}>
                                <Link href={"/login"} color={'blue.400'}>Already registered?</Link>
                            </Stack>
                            <Button
                                type={"submit"}
                                bg={'blue.400'}
                                color={'white'}
                                _hover={{
                                    bg: 'blue.500',
                                }}>
                                Sign up
                            </Button>
                        </Stack>
                    </form>
                    </Box>
                </Stack>
            </Flex>
        )
    }


}

export default Register;