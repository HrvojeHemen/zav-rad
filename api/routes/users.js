const express = require('express');
const router = express.Router();
const db = require("./dbConnection");

/* GET users listing. */
router.get('/:id', async function (req, res, next) {
    let {id} = req.params;

    let userById = getUserById(id)
    res.json(userById)
});

let getUserById = async function (id) {
    let res = await db.query(`SELECT *
                              from users
                              where id = '${id}'`);

    return res.rows
}


module.exports = router;
