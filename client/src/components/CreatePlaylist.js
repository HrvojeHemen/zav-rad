import React, {Component} from "react";
import axios from "axios";
import NavBar from "./NavBar";
import auth from "./useTokenClass";
import jwt from "jsonwebtoken"


class CreatePlaylist extends Component {

    state = {
        name: null,
        urls: null
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let {name, urls} = this.state;
        let decoded = jwt.decode(auth.token)
        console.log(decoded)
        axios.post('http://localhost:3000/playlist',
            {
                "playlistName":name,
                "urls":urls,
                "creatorId": decoded.id
            })
            .then(r => {
                if(r.data.err){
                    alert(r.data.err)
                }
                else{


                    console.log("Decoded", decoded)

                }
            })
    }

    render() {

        return (

            <div>
                <NavBar />
                CREATE PLAYLIST PAGE
                <form onSubmit={this.handleSubmit}>
                    <label>Playlist Name:
                        <input type="text"
                               name={"name"}
                               required={true}
                               onChange={(e) => this.setState({name: e.target.value})}
                        />
                    </label>
                    <br/>
                    <label>Song urls separated by comma:
                        <br/>
                        <textarea
                               rows={30}
                               cols={50}
                               name={"urls"}
                               required={true}
                               onChange={(e) => this.setState({urls: e.target.value})}
                        />
                    </label>
                    <br/>
                    <input type="submit"/>
                </form>


            </div>
        )
    }


}

export default CreatePlaylist;