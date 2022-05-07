import {Link} from "react-router-dom";
import {Center, Divider, HStack, Text, VStack} from "@chakra-ui/react";
import jwt from "jsonwebtoken";
import {auth} from "./useTokenClass";

const MenuItem = ({children, to = "/", ...rest}) => {

    if (to === window.location.pathname) return <></>

    return (
        <Link to={to}>
            <Text display="block" color={"dodgerblue"}  {...rest}>
                {children}
            </Text>
        </Link>
    )
}

const NavBar = () => {
    let decoded = jwt.decode(auth.token, undefined)


    return <Center>
        <VStack>
            <HStack spacing={8}
                    align="center"
                    justify={["center", "space-between", "flex-end", "flex-end"]}
                    direction={["column", "row", "row", "row"]}
                    pt={[4, 4, 0, 0]}>

                <MenuItem to={"/choose-room"}>Choose room</MenuItem>
                <MenuItem to={"/profile"}>Profile</MenuItem>
                {decoded.role === 0 ? <MenuItem to={"/adminDashboard"}>Admin Dashboard</MenuItem> : ""}
            </HStack>
            <Divider/>
            <br/>
        </VStack>


    </Center>

}

export default NavBar
