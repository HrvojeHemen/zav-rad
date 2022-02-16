import './App.css';
import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";

import {auth} from "./components/useTokenClass";

import RoomChooser from "./components/RoomChooser"
import Login from "./components/Login";
import Register from "./components/Register"
import Logout from "./components/Logout"
// import CreatePlaylist from "./components/CreatePlaylist";
import Room from "./components/Room";


let isLoggedIn = function () {
    const token = auth.token;
    let loggedIn = token !== undefined && token !== null;
    console.log("Login status,", loggedIn)
    return loggedIn
}


let PrivateRoute = function () {
    const token = auth.token
    console.log("Token", token, !!token)

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    if (isLoggedIn()) {
        console.log("Returning outlet, token exists")
        return <Outlet/>
    } else {
        console.log("Returning /, token doesn't exists")
        return <Navigate to="/"/>
    }
}

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route exact path={"/"} element={<Navigate to={"/login"}/>}/>

                {/*IF LOGGED IN GO TO /, OTHERWISE GO TO LOGIN OR REGISTER*/}
                <Route path={"/login"} element={<Login/>}/>

                <Route path={"/register"} element={<Register/>}/>


                <Route path='/choose-room' element={<PrivateRoute/>}>
                    <Route path='/choose-room' element={<RoomChooser/>}/>
                </Route>

                <Route path='/play' element={<PrivateRoute/>}>
                    <Route path='/play' element={<Room/>}/>
                </Route>


                <Route path='/logout' element={<PrivateRoute/>}>
                    <Route path='/logout' element={<Logout/>}/>
                </Route>


                {/*DEFAULT ROUTE*/}
                {/*<Route path={"*"} element={<Navigate to={"/"}/>}/>*/}

            </Routes>
        </BrowserRouter>

    );
}

export default App;
