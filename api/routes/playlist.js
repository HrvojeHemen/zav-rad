var express = require('express');
const request = require("request");
const axios = require('axios')


var router = express.Router();
// const bodyParser = require("body-parser");
// router.use(bodyParser.json({type: "application/*+json"}));
let rez =
    {
        "songs":
            ["https://www.youtube.com/watch?v=NhUFs3oqGlw",
            "https://www.youtube.com/watch?v=syFZfO_wfMQ",
            "https://www.youtube.com/watch?v=W-TE_Ys4iwM",
            "https://www.youtube.com/watch?v=_kqQDCxRCzM"
        ]
    }

/* GET users listing. */
router.get('/', async function (req, res, next) {

    let formattedPlaylist = {"songs": []}
    for (const song in rez.songs) {
        let url = rez.songs[song];
        let timestamp = Math.random() * 0.7


        await axios({
            url: url,
        })
            .then(res => console.log(res))
            .then(function(data){
            console.log(data)
            formattedPlaylist.songs.push(
                {
                    "url":url,
                    "startTimestamp": timestamp
                }
            )
        })


    }
    res.json(formattedPlaylist);
});

module.exports = router;
