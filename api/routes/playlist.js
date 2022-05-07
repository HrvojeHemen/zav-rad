const express = require('express');
const db = require("./dbConnection");
const ytdl = require('ytdl-core');
const ytpl = require('ytpl')

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

router.get('/subscriptions/:id', async function (req, res, next) {
    let {id} = req.params;

    let playLists = await getAllSubscriptionsForUser(id);
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

getAllSubscriptionsForUser = async function (user_id) {
    let res = await db.query(`SELECT *
                              from subscriptions join playlists p on p.id = subscriptions.playlist_id
                              where user_id = '${user_id}'`);
    return res.rows;
}

//change urls variable to yt_playlist_id variable
router.post("/", async function (req, res, next) {
    console.log("Body: ", req.body)
    let {playlistName, url, creatorId} = req.body;
    url = url.trim()
    let playlist_id = 1

    try {
        playlist_id = await createPlaylist(playlistName, creatorId)
        let playlistInfo = await ytpl(url, {pages: 25})

        for (let playlistInfoElement of playlistInfo.items) {
            let title = playlistInfoElement.title;
            let url = playlistInfoElement.shortUrl;


            try {
                let songId = await createSong(playlist_id, title, url)
                console.log("Created song with id: " + songId)
            } catch (err) {
                console.log(err)
            }
        }

        // }
    } catch (err) {
        console.log("Error while creating playlist", err)
    }

    res.json(
        {id: playlist_id}
    )


});


createPlaylist = async function (playlistName, creatorId) {
    let res = await db.query(`
        insert into playlists(name, creator_id)
        values ('${playlistName}', '${creatorId}')
        returning id`)
    return res.rows[0]['id']
}

createSong = async function (playlist_id, title, url) {
    title = title.replaceAll("'", "''")
    let spl = title.split('-');

    let token1 = spl[0].trim();
    token1 = token1.split("(")[0]
    token1 = token1.split("[")[0]

    let token2 = spl[1] ? spl[1].trim() : "";
    token2 = token2.split("(")[0]
    token2 = token2.split("[")[0]
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
        try {
            url = url.replaceAll("'", "''")
            token1 = token1.replaceAll("'", "''")
            token2 = token2.replaceAll("'", "''")
            await db.query(`UPDATE songs
                            SET url    = '${url}',
                                token1 = '${token1}',
                                token2 = '${token2}'
                            where id = '${id}'`)
            res.sendStatus(200)
        } catch (err) {
            console.log(err)
            res.json({"err": err})
        }
    }
})

router.get('/subscription/:userId/:playlistId', async function (req, res, next) {
    let {userId, playlistId} = req.params;
    try {
        let rows = (await db.query(`
            SELECT *
            from subscriptions
            where playlist_id = '${playlistId}'
              and user_id = '${userId}'
        `)).rows

        res.json({
            status: rows.length > 0
        })
    } catch (err) {
        console.log(err)
        res.json(err)
    }

})

router.post('/subscribe/:userId/:playlistId', async function (req, res, next) {
    let {userId, playlistId} = req.params;

    console.log(userId, playlistId)
    try {
        await db.query(`
            INSERT INTO subscriptions(playlist_id, user_id)
            values ('${playlistId}', '${userId}')
        `)
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.json(err)
    }

})


router.post('/unsubscribe/:userId/:playlistId', async function (req, res, next) {
    let {userId, playlistId} = req.params;
    try {
        await db.query(`
            DELETE
            FROM subscriptions
            where playlist_id = '${playlistId}'
              and user_id = '${userId}';
        `)
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.json(err)
    }
})

router.post('/delete/:userId/:playlistId', async function (req, res, next) {
    let {userId, playlistId} = req.params;

    console.log(userId, playlistId)
    try {
        await db.query(`
            DELETE
            FROM playlists
            where creator_id = '${userId}'
              AND id = '${playlistId}';
        `)
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        res.json(err)
    }

})
module.exports = router;
