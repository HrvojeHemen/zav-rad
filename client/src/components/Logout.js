import React, {Component} from "react";

import auth from "./useTokenClass";
import {Navigate} from "react-router-dom";

class Logout extends Component {

    state = {
        redirect : false
    }

    logout = () => {
        auth.saveToken(undefined)
        this.setState({redirect:true})
    }
    render() {
        const {redirect} = this.state;
        if(redirect){
            return <Navigate to={"/"}/>
        }

        return (

            <div>
                LOGOUT PAGE
                <button onClick={this.logout}>LOG OUT</button>

            </div>
        )
    }


}

export default Logout;