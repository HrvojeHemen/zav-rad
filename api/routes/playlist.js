var express = require('express');
var router = express.Router();
// const bodyParser = require("body-parser");
// router.use(bodyParser.json({type: "application/*+json"}));
let rez =
    {
        "songs": ["https://www.youtube.com/watch?v=NhUFs3oqGlw",
            "https://www.youtube.com/watch?v=syFZfO_wfMQ",
            "https://www.youtube.com/watch?v=W-TE_Ys4iwM",
            "https://www.youtube.com/watch?v=_kqQDCxRCzM"
        ]
    }

/* GET users listing. */
router.get('/', function(req, res, next) {
   res.json(rez);
});

module.exports = router;
