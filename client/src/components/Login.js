import React, {Component} from "react";
import axios from "axios";
import NavBar from "./NavBar";
import {Navigate} from "react-router-dom";

import auth from "./useTokenClass";


class Login extends Component {

    state = {
        userName: null,
        password: null,
        redirect: auth.token !== undefined
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
        console.log("Current token:", auth.token)
        const {redirect} = this.state;
        if(redirect){
            return <Navigate to={"/play"}/>
        }

        return (

            <div>
                <NavBar />
                LOGIN PAGE
                <form onSubmit={this.handleSubmit}>
                    <label>UserName:
                        <input type="text"
                               name={"userName"}
                               required={true}
                               onChange={(e) => this.setState({userName: e.target.value})}
                        />
                    </label>
                    <br/>
                    <label>Password:
                        <input type="password"
                               name={"password"}
                               required={true}
                               onChange={(e) => this.setState({password: e.target.value})}
                        />
                    </label>
                    <br/>
                    <input type="submit"/>
                </form>


            </div>
        )
    }


}

export default Login;