import './App.css';
import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
import YoutubeEmbed from "./components/YoutubeEmbed";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path={"/"} element={<YoutubeEmbed videoUrl={"https://www.youtube.com/watch?v=hQAHSlTtcmY"}/>}/>

            </Routes>
        </BrowserRouter>

    );
}

export default App;
