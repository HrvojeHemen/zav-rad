import React, {Component} from "react";
import axios from "axios";
import {Navigate} from "react-router-dom";
import NavBar from "./NavBar";
import {auth} from "./useTokenClass";
import {Button, Center, FormControl, FormLabel, Input} from "@chakra-ui/react";

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

        axios.post('http://localhost:3000/register',
            {
                "mail": mail,
                "username": userName,
                "password": password
            })
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


            <div>
                <NavBar/>
                <Center>
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

                        <Button type="submit" colorScheme='blue' margin={"5px 0"}>REGISTER</Button>
                    </form>

                </Center>
            </div>
        )
    }


}

export default Register;