import {Link} from "react-router-dom";
import {Flex, HStack, Stack, Text} from "@chakra-ui/react";

const {Component} = require("react");


const MenuItem = ({children, isLast, to = "/", ...rest}) => {
    return (
        <Link to={to} >
            <Text display="block" color={"dodgerblue"}  {...rest}>
                {children}
            </Text>
        </Link>
    )
}

class NavBar extends Component {


    render() {

        return <HStack spacing={8}
                       align="center"
                       justify={["center", "space-between", "flex-end", "flex-end"]}
                       direction={["column", "row", "row", "row"]}
                       pt={[4, 4, 0, 0]}>

            <MenuItem to={"/login"}>Log In</MenuItem>
            <MenuItem to={"/register"}>Register</MenuItem>
            <MenuItem to={"/choose-room"}>Choose room</MenuItem>
            <MenuItem to={"/logout"}>Log out</MenuItem>
            <MenuItem to={"/create"}>Create Playlist</MenuItem>

        </HStack>

    }

}

export default NavBar
