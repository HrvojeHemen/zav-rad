const express = require("express");
const db = require("./dbConnection");
const bcrypt = require("bcrypt");

const router = express.Router();

const salt = 10;

router.get("/", function(req, res, next) {
    res.send("REGISTER PAGE");
});

router.post("/", async function(req, res, next) {
    console.log("Body: " ,req.body)
    let {mail,username,password} = req.body;
    console.log(mail,username,password)

    let rez = (await db.query(`SELECT * FROM users where username = '${username}' or mail = '${mail}'`)).rows

    if(rez.length > 0){
        console.log("User already exists")
        res.json({"err":"Username or mail already exist"})
    }
    else{
        let hash = await bcrypt.hash(password,salt)


        console.log("Inserting into db")
        let id = (await db.query(`INSERT INTO users(username, mail, password)
                                values ('${username}','${mail}', '${hash}') returning id`)).rows[0].id
        console.log("New user")
        res.json({"id":id})
    }

});


module.exports = router;