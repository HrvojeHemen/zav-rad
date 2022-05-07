const express = require('express');
const router = express.Router();
const db = require("./dbConnection");
const bcrypt = require("bcrypt");
const {query} = require("./dbConnection");

/* GET users listing. */
router.get('/byId/:id', async function (req, res, next) {
    let {id} = req.params;

    let userById = await getUserById(id)
    res.json(userById)
});

let getUserById = async function (id) {
    let res = await db.query(`SELECT *
                              from users
                              where id = '${id}'`);

    return res.rows
}


router.get('/getAll', async function (req, res, next) {

    let allUsers = await getAllUsers()

    res.json(allUsers)
});

async function updateUser(id, username, mail) {

    try {
        await db.query(`UPDATE users
                        SET username = '${username}',
                            mail     = '${mail}'
                        where id = '${id}';`)
        return 0;
    } catch (err) {
        return -1;
    }
}

router.post("/update", async function (req, res, next) {

    let {id, username, mail} = req.body;
    console.log(id, username, mail)
    let result = await updateUser(id, username, mail);

    res.json(0)
});

router.post('/delete/:id', async function (req, res, next) {
    let {id} = req.params;
    await db.query(`DELETE
                    from users
                    where id = '${id}'`)

    res.sendStatus(200)
});

let getAllUsers = async function () {
    let res = await db.query(`SELECT *
                              from users`)

    return res.rows;

}

module.exports = router;
