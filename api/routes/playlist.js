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

router.get('/all', async function (req, res, next) {
    let playlists = await getAllPlaylists();
    res.json(playlists);
});
router.get('/test', async function (req, res, next) {
    await createSong()
    res.sendStatus(304);
})

getAllPlaylists = async function () {
    let res = await db.query(`SELECT *
                              from playlists`);
    return res.rows;
}

router.post("/", async function (req, res, next) {
    console.log("Body: ", req.body)
    let {playlistName, urls, creatorId} = req.body;


    try{
        let playlist_id = await createPlaylist(playlistName, creatorId)

        for (const url of urls) {
            let trimmed = url.trim();
            if(trimmed.length > 0){
                try{
                    let songId = await createSong(playlist_id, trimmed);
                    console.log("Created song with id", songId)
                }
                catch(err){
                    console.log("Error while creating song", err)
                }

            }
        }
    }
    catch(err){
        console.log("Error while creating playlist", err)
    }


});


createPlaylist = async function (playlistName, creatorId) {
    let res = await db.query(`
        insert into playlists(name, creator_id)
        values ('${playlistName}', '${creatorId}')
        returning id`)
    return res.rows[0]['id']
}

createSong = async function (playlist_id, url) {
    console.log(`Creating song with url "${url}"`, "and id", playlist_id)
    let info = await ytdl.getBasicInfo(url);
    let title = info['videoDetails']['title']
    let spl = title.split('-');

    let token1 = spl[0];
    let token2 = spl[1] ? spl[1] : "";

    let res = await db.query(`
        insert into songs(playlist_id, url, token1, token2)
        values ('${playlist_id}', '${url}', '${token1}', '${token2}')
        returning id
    `)
    return res['rows'][0]['id']

}


module.exports = router;
