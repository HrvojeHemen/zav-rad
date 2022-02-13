import './App.css';
import React, {useEffect, useState} from 'react';
import io from 'socket.io-client'
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Room from "./components/Room";
import SocketTest from "./components/SocketTest";
import RoomChooser from "./components/RoomChooser"

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<RoomChooser/>}/>
                <Route path={"play"} element={<Room/>}/>
                <Route path={"socket"} element={<SocketTest/>}/>
            </Routes>
        </BrowserRouter>

    );
}

export default App;
