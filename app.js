var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var log = require("./routes/util/logger");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var RedisStore = require("connect-redis")(session);
var Code = require("./config/Code");
var SystemConfig = require("./config/SystemConfig");
var redis = require("./routes/database/redis");

var userRoute = require("./routes/userRoute");
var advertRoute = require("./routes/advertRoute");

var app = express();


// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.engine('html',require("ejs").renderFile);
app.set('view engine', 'html');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    store : new RedisStore({
        host : SystemConfig.REDIS_HOST,
        port : SystemConfig.REDIS_PORT,
        ttl : SystemConfig.REDIS_EXPIRES
    }),
    secret : "server"
}))
app.use(express.static(path.join(__dirname, 'public')));
//app.use(bodyParser({uploadDir:"./uploads"}));
app.use(require('connect-multiparty')({uploadDir:"./uploads"}));

app.use(userRoute);
app.use("/advert",advertRoute)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.render('error', {
        message: "not found",
        error: ""
    });
});
// error handlers
// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
var server = app.listen(3001, function() {
    log.info('Express server listening on port ' + server.address().port);
});

module.exports = app;
