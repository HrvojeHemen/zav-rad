import React, {Component, useEffect, useState} from "react";
import {socket} from "./socket";
import axios from "axios";
import {Navigate} from "react-router-dom";


class Register extends Component {

    state = {
        mail: null,
        userName: null,
        password: null,
        password2: null,
        redirect: false
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
                    "username":userName,
                    "password":password
                })
            .then(r => {
                if(r.data.err){
                    alert(r.data.err)
                }
                else{
                    this.setState({redirect:true})
                }
            })


        //console.log(this.state)

    }

    render() {
        const {redirect} = this.state;
        if(redirect){
            return <Navigate to={"/login"}/>
        }

        return (



            <div>
                REGISTER PAGE
                <form onSubmit={this.handleSubmit}>
                    <label>Mail:
                        <input type="email"
                               name={"mail"}
                               required={true}
                               onChange={(e) => this.setState({mail: e.target.value})}
                        />
                    </label>
                    <br/>
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
                    <label>Confirm Password:
                        <input type="password"
                               name={"password2"}
                               required={true}
                               onChange={(e) => this.setState({password2: e.target.value})}
                        />
                    </label>
                    <br/>

                    <input type="submit"/>
                </form>


            </div>
        )
    }


}

export default Register;