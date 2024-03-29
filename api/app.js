require('dotenv').config();

const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const playlistRouter = require('./routes/playlist')
const registerRouter = require('./routes/register')
const loginRouter = require('./routes/login')
const statsRouter = require('./routes/stats')

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.set('view engine', 'jade');



app.use('/', indexRouter)
app.use('/users', usersRouter);
app.use('/playlist', playlistRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter)
app.use('/stats', statsRouter)


// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   saveUninitialized: false,
//   resave: false,
//   cookie: {
//     httpOnly: true,
//     maxAge: 60 * 60 * 1000
//   }
//
// }))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;