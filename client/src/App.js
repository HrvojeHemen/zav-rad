import './App.css';
import React from 'react';
import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";

import {auth} from "./components/useTokenClass";

import RoomChooser from "./components/RoomChooser"
import Login from "./components/Login";
import Register from "./components/Register"
import Logout from "./components/Logout"
import Room from "./components/Room";
import CreatePlaylist from "./components/CreatePlaylist";
import Profile from "./components/Profile"
import MyPlaylists from "./components/MyPlaylists"
import {ChakraProvider} from '@chakra-ui/react'
import EditPlaylist from "./components/EditPlaylist";
import PlaylistViewer from "./components/PlaylistViewer";
import AdminDashboard from "./components/AdminDashboard";
import ScoresViewer from "./components/ScoresViewer";


let isLoggedIn = function () {
    const token = auth.token;
    //console.log("Login status,", loggedIn)
    return token !== undefined && token !== null
}


let PrivateRoute = function () {
    //console.log("Token", token, !!token)

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    if (isLoggedIn()) {
        //console.log("Returning outlet, token exists")
        return <Outlet/>
    } else {
        //console.log("Returning /, token doesn't exists")
        return <Navigate to="/"/>
    }
}

function App() {
    return (
        <ChakraProvider>
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

                    <Route path='/create-playlist' element={<PrivateRoute/>}>
                        <Route path='/create-playlist' element={<CreatePlaylist/>}/>
                    </Route>

                    <Route path='/profile' element={<PrivateRoute/>}>
                        <Route path='/profile' element={<Profile/>}/>
                    </Route>

                    <Route path='/my-playlists' element={<PrivateRoute/>}>
                        <Route path='/my-playlists' element={<MyPlaylists/>}/>
                    </Route>

                    <Route path='/edit-playlist/:id' element={<PrivateRoute/>}>
                        <Route path='/edit-playlist/:id' element={<EditPlaylist/>}/>
                    </Route>

                    <Route path='/playlist/:id' element={<PrivateRoute/>}>
                        <Route path='/playlist/:id' element={<PlaylistViewer/>}/>
                    </Route>

                    <Route path='/adminDashboard' element={<PrivateRoute/>}>
                        <Route path='/adminDashboard' element={<AdminDashboard/>}/>
                    </Route>

                    <Route path='/scores/:id' element={<PrivateRoute/>}>
                        <Route path='/scores/:id' element={<ScoresViewer/>}/>
                    </Route>



                    {/*DEFAULT ROUTE*/}
                    <Route path={"*"} element={<Navigate to={"/"}/>}/>

                </Routes>
            </BrowserRouter>
        </ChakraProvider>

    );
}

export default App;
