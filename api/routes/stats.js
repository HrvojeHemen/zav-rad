const express = require('express');
const router = express.Router();
const db = require("./dbConnection");

router.post('/save', async function (req, res, next) {
    let {room, playlistID} = req.body;
    let {users} = room;

    for (const key of Object.keys(users)) {
        let user = users[key]
        console.log(user)
        let {id, score} = user

        await saveScore(id, score, playlistID);
    }

    res.sendStatus(200)
});



let saveScore = async function(userID, score, playlistID){
    let query = `INSERT INTO scores (playlist_id, user_id, score) VALUES ('${playlistID}', '${userID}', '${score}')`
    console.log(query)
    await db.query(query)
}

router.get('/getByUserId/:id', async function (req, res, next) {
    let {id} = req.params

    let scores = await getAllByID(id)

    console.log(scores)

    res.json(scores)

});

let getAllByID = async function(userID){
    let query = `SELECT * from scores where user_id = '${userID}'`;
    let result = await db.query(query);

    return result['rows']
}

module.exports = router;