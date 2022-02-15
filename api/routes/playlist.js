const express = require('express');
const db = require("./dbConnection");
const ytdl = require('ytdl-core');

const router = express.Router();
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

        await ytdl.getBasicInfo(url).then(info => {
            console.log(info['videoDetails']['title'])
            formattedPlaylist.songs.push(
                {
                    "url": url,
                    "startTimestamp": timestamp
                }
            )
        })
    }
    res.json(formattedPlaylist);
});

router.post("/", async function (req, res, next) {
    console.log("Body: ", req.body)
    let {playlistName, urls, creatorId} = req.body;

    //TODO HARDCODEANO JE CREATOR ID UVIJEK 0
    let playlistId = createPlaylist(playlistName, 0)



});


createPlaylist = async function (playlistName, creatorId) {
    let res = await db.query(`
        insert into playlists(name, creator_id)
        values ('${playlistName}', '${creatorId}')
        returning id`)
    return res.rows[0]['id']
}

createSong = async function (playlistId, url) {
    let info = await ytdl.getBasicInfo(url);
    let title = info['videoDetails']['title']

    let spl = title.split('-')


}


module.exports = router;
