import React, {Component} from "react";
import axios from "axios";
import NavBar from "./NavBar";
import {auth} from "./useTokenClass";
import jwt from "jsonwebtoken"
import {Button, Center, FormControl, FormLabel, Input, Link, Text, Textarea} from "@chakra-ui/react";


class CreatePlaylist extends Component {

    state = {
        name: null,
        urls: null
    }

    handleSubmit = (event) => {
        event.preventDefault();
        let {name, urls} = this.state;
        let decoded = jwt.decode(auth.token)

        let splitUrls = urls.split("\n")

        let formattedUrls = []

        splitUrls.forEach(url => {
            formattedUrls.push(url.trim())
        })

        axios.post(process.env.REACT_APP_API_URL + "/playlist",
            {
                "playlistName":name,
                "urls":formattedUrls,
                "creatorId": decoded.id
            },{headers:  {'Content-Type': undefined} } )
            .then(r => {
                if(r.data.err){
                    alert(r.data.err)
                }
                else{
                    console.log("Created playlist successfully")
                }
            })
    }

    render() {

        return (

            <div>
                <NavBar />
                <Center>
                <form onSubmit={this.handleSubmit}>
                    <FormControl isRequired>
                        <FormLabel htmlFor='userName'>Playlist Name:</FormLabel>
                        <Input type="text"
                               name={"name"}
                               onChange={(e) => this.setState({name: e.target.value})}
                        />
                    </FormControl>

                    <Text>Song urls, one url per line:</Text>
                   <Textarea
                               rows={15}
                               cols={50}
                               name={"urls"}
                               required={true}
                               onChange={(e) => this.setState({urls: e.target.value})}
                        />

                    <br/>
                    <Button type="submit" colorScheme='blue' margin={"5px 0"}>CREATE PLAYLIST</Button>
                    <Link href={"http://www.williamsportwebdeveloper.com/FavBackUp.aspx"} isExternal={true}><Button> Use this to convert YT playlist to separate links</Button></Link>

                </form>
                </Center>

            </div>
        )
    }


}

export default CreatePlaylist;