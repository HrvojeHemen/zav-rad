import '../stylesheets/NavBar.css'
import {Link} from "react-router-dom";

const {Component} = require("react");

class NavBar extends Component {


    render() {

        return <div className={"navbar"}>

            <div>


                <Link to={"/login"}>login</Link>
                <Link to={"/register"}>register</Link>
                <Link to={"/play"}>play</Link>
                <Link to={"/logout"}>logout</Link>
                <Link to={"/create-playlist"}>create playlist</Link>

            </div>

        </div>

    }

}

export default NavBar
