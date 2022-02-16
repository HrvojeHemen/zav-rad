import React, {Component} from "react";
import {auth} from "./useTokenClass";
import {Navigate} from "react-router-dom";
import NavBar from "./NavBar";

class Logout extends Component {

    state = {
        redirect: false
    }

    logout = function () {
        auth.deleteToken()
        console.log("Logging out, token after", auth.token)
        this.setState({redirect: true})
    }.bind(this)

    render() {
        const {redirect} = this.state;
        if (redirect) {
            //window.location.reload();
            return <Navigate to={"/"}/>
        }

        return (

            <div>
                <NavBar/>
                LOGOUT PAGE
                <button onClick={this.logout}>LOG OUT</button>
            </div>
        )
    }


}

export default Logout;