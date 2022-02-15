import './App.css';
import React, {useEffect, useState, FC} from 'react';
import io from 'socket.io-client'
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";

import useToken from "./components/useToken";

import Room from "./components/Room";
import SocketTest from "./components/SocketTest";
import RoomChooser from "./components/RoomChooser"
import Login from "./components/Login";
import Register from "./components/Register"

const PrivateRoute = () => {
    const auth = useToken()
    console.log(auth)

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return auth.token ? <Outlet /> : <Navigate to="/login" />;
}




function App() {
    const auth = useToken()

    return (
        <BrowserRouter>
            <Routes>
                {/*IF LOGGED IN GO TO /, OTHERWISE GO TO LOGIN*/}
                <Route path={"/login"} element={auth.token ? <Navigate to={"/"}/> :<Login/>} />
                <Route path={"/register"} element={<Register/>} />

                <Route path={"/"} element={<RoomChooser/>} />

                <Route exact path='/play' element={<PrivateRoute/>}>
                    <Route exact path='/play' element={<Room/>}/>
                </Route>

                <Route path={"socket"} element={<SocketTest/>} />

                {/*DEFAULT ROUTE*/}
                <Route path={"*"} element={<Navigate to={"/"}/>}/>

            </Routes>
        </BrowserRouter>

    );
}

export default App;
