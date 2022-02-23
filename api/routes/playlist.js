const express = require('express');
const db = require("./dbConnection");
const ytdl = require('ytdl-core');

const router = express.Router();
// const bodyParser = require("body-parser");
// router.use(bodyParser.json({type: "application/*+json"}));

/* GET users listing. */
router.get('/', async function (req, res, next) {
    // let formattedPlaylist = {"songs": []}
    // for (const song in rez.songs) {
    //     let url = rez.songs[song];
    //     let timestamp = Math.random() * 0.7
    //
    //     await ytdl.getBasicInfo(url).then(info => {
    //         console.log(info['videoDetails']['title'])
    //         formattedPlaylist.songs.push(
    //             {
    //                 "url": url,
    //                 "startTimestamp": timestamp
    //             }
    //         )
    //     })
    // }
    // res.json(formattedPlaylist);
    res.render("Nothing here")
});

router.get('/all', async function (req, res, next) {
    let playlists = await getAllPlaylists();


    res.json(playlists);
});

getAllPlaylists = async function () {
    let res = await db.query(`SELECT *
                              from playlists`);
    return res.rows;
}

router.get("/byId/:id", async function (req, res, next) {
    let {id} = req.params
    //console.log(id)
    let playlist = {}
    try {
        playlist = (await getPlaylistById(id))[0];
        playlist['songs'] = await getSongsFromPlaylist(id)
        playlist['creator'] = (await getUserById(playlist['creator_id']))[0]
        delete playlist['creator']['password']
    } catch (err) {
        playlist = null
        //console.log("Err", err)
    }
    res.json(playlist)
})
getPlaylistById = async function (playlist_id) {
    let res = await db.query(`SELECt *
                              from playlists
                              where id = '${playlist_id}'`)
    return res.rows
}
let getUserById = async function (id) {
    let res = await db.query(`SELECT *
                              from users
                              where id = '${id}'`);

    return res.rows
}


router.get('/user/:id', async function (req, res, next) {
    let {id} = req.params;

    let playLists = await getAllPlaylistsForUser(id);
    console.log(playLists)
    for (let playlist of playLists) {

        playlist['songs'] = await getSongsFromPlaylist(playlist.id);
        //console.log(playlist)
    }
    res.json(playLists);
})


getAllPlaylistsForUser = async function (user_id) {
    let res = await db.query(`SELECT *
                              from playlists
                              where creator_id = '${user_id}'`);
    return res.rows;
}

router.post("/", async function (req, res, next) {
    console.log("Body: ", req.body)
    let {playlistName, urls, creatorId} = req.body;

    try {
        let playlist_id = await createPlaylist(playlistName, creatorId)

        for (const url of urls) {
            let trimmed = url.trim();
            if (trimmed.length > 0) {
                try {
                    let songId = await createSong(playlist_id, trimmed);
                    console.log("Created song with id", songId)
                } catch (err) {
                    console.log("Error while creating song")
                    console.log(err)
                }

            }
        }
    } catch (err) {
        console.log("Error while creating playlist", err)
    }

    res.sendStatus(200)


});


createPlaylist = async function (playlistName, creatorId) {
    let res = await db.query(`
        insert into playlists(name, creator_id)
        values ('${playlistName}', '${creatorId}')
        returning id`)
    return res.rows[0]['id']
}

createSong = async function (playlist_id, url) {
    console.log(`Creating song with url "${url}"`, "and playlist id", playlist_id)
    let info = await ytdl.getBasicInfo(url);
    let title = info['videoDetails']['title']
    title = title.replaceAll("'", "''")
    let spl = title.split('-');

    let token1 = spl[0].trim();
    let token2 = spl[1] ? spl[1].trim() : "";
    console.log("pid,T,t1,t2", playlist_id, title, token1, token2)
    let res = await db.query(`
        insert into songs(playlist_id, url, token1, token2)
        values ('${playlist_id}', '${url}', '${token1}', '${token2}')
        returning id
    `)
    return res['rows'][0]['id']

}

getSongsFromPlaylist = async function (playlist_id) {
    let songs = await db.query(`SELECT *
                                from songs
                                where playlist_id = '${playlist_id}'`)
    return songs.rows

}

router.post('/editSong/:id', async function (req, res, next) {
    let {id, url, token1, token2, del} = req.body;


    if (del) {
        await db.query(`DELETE
                        FROM songs
                        where id = '${id}'`)
        res.sendStatus(200)
    } else {
        try{
            url = url.replaceAll("'","''")
            token1 = token1.replaceAll("'","''")
            token2 = token2.replaceAll("'","''")
            await db.query(`UPDATE songs
                        SET url    = '${url}',
                            token1 = '${token1}',
                            token2 = '${token2}'
                        where id = '${id}'`)
            res.sendStatus(200)
        }
        catch (err){
            console.log(err)
            res.json({"err": err})
        }
    }
})

module.exports = router;
