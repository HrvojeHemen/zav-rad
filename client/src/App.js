import './App.css';
import React from 'react';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";

import auth from "./components/useTokenClass";

import Room from "./components/Room";
import RoomChooser from "./components/RoomChooser"
import Login from "./components/Login";
import Register from "./components/Register"
import Logout from "./components/Logout"
import CreatePlaylist from "./components/CreatePlaylist";



const PrivateRoute = () => {
    console.log(auth)

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return auth.token ? <Outlet /> : <Navigate to="/login" />;
}




function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path={"/"} element={<Navigate to={"/login"}/>} />

                {/*IF LOGGED IN GO TO /, OTHERWISE GO TO LOGIN*/}
                <Route path={"/login"} element={auth.token ? <Navigate to={"/play"}/> :<Login/>} />
                <Route path={"/register"} element={auth.token ? <Navigate to={"/play"}/> : <Register/>} />



                <Route exact path='/play' element={<PrivateRoute/>}>
                    <Route exact path='/play' element={<Room/>}/>
                </Route>

                <Route exact path='/create-playlist' element={<PrivateRoute/>}>
                    <Route exact path='/create-playlist' element={<CreatePlaylist/>}/>
                </Route>

                <Route exact path='/logout' element={<PrivateRoute/>}>
                    <Route exact path='/logout' element={<Logout/>}/>
                </Route>


                {/*DEFAULT ROUTE*/}
                <Route path={"*"} element={<Navigate to={"/"}/>}/>

            </Routes>
        </BrowserRouter>

    );
}

export default App;
