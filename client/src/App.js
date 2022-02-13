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

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<Room/>}/>
                <Route path={"socket"} element={<SocketTest/>}/>
            </Routes>
        </BrowserRouter>

    );
}

export default App;
