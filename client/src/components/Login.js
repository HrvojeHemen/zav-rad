import React, {Component} from "react";
import axios from "axios";
import NavBar from "./NavBar";
import {Navigate} from "react-router-dom";

import {auth} from "./useTokenClass";
import {Button, Center, FormControl, FormLabel, Input} from "@chakra-ui/react";


class Login extends Component {

    state = {
        userName: null,
        password: null,
        redirect: !!auth.token
    }

    handleSubmit = (event) => {
        event.preventDefault();

        let {userName, password} = this.state;

        axios.post('http://localhost:3000/login',
            {
                "username":userName,
                "password":password
            })
            .then(r => {
                if(r.data.err){
                    alert(r.data.err)
                }
                else{

                    let loginToken = r.data.token;
                    console.log("Token", loginToken)
                    auth.saveToken(loginToken)
                    console.log("Auth token", auth.token)

                    this.setState({redirect: true})
                }
            })
    }

    render() {
        const {redirect} = this.state;
        if(redirect){
            return <Navigate to={"/choose-room"}/>
        }

        return (

            <div>
                <NavBar />

                <Center>
                <form onSubmit={this.handleSubmit}>
                    <FormControl isRequired>
                    <FormLabel htmlFor='userName'>User name</FormLabel>
                        <Input type="text"
                               name={"userName"}
                               onChange={(e) => this.setState({userName: e.target.value})}
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

                    <Button type="submit" colorScheme='blue' margin={"5px 0"}>LOG IN</Button>
                </form>

                </Center>
            </div>
        )
    }


}

export default Login;