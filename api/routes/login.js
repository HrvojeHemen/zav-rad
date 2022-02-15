const express = require("express");
const db = require("./dbConnection");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

const router = express.Router();


router.get("/", function(req, res, next) {
    res.send("LOGIN PAGE");
});

router.post("/", async function(req, res, next) {
    console.log("Body: " ,req.body)
    let {username,password} = req.body;
    console.log(username,password)



    let rez = (await db.query(`SELECT * FROM users where username = '${username}'`)).rows

    if(rez.length === 0){
        let msg = "User with that username not found";
        console.log(msg)
        res.json({"err":msg})
    }
    else{
        let verified = await bcrypt.compareSync(password,rez[0]['password'])
        console.log("Verification", verified)

        let secret = process.env.JWT_SECRET;
        if(!verified){
            res.json({"err":"Wrong password"})
        }
        else{

            const token = jwt.sign(
                {
                    id: rez[0]["id"],
                    username: username,
                    role: rez[0]["role"]
                },
                    secret,
                {
                    expiresIn: "2h",
                }
            );

            res.json({"token": token})
        }


    }

});


module.exports = router;