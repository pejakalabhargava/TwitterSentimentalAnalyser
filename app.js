var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
//Use twit module of node
var Twit = require('twit');
//Set twitter related keys from environamnet variable
var T = new Twit({
    consumer_key:process.env.TWITTER_CONSUMER_KEY
  , consumer_secret:process.env.TWITTER_CONSUMER_SECRET
  , access_token:process.env.TWITTER_ACCESS_TOKEN
  , access_token_secret: process.env.TWITTER_ACCESS_SECRET
});
//Create the server on 3000 port
var app = express();
var server = require("http").createServer(app);
var port = 3000;
server.listen(port);
console.log("Socket.io server listening at http://127.0.0.1:" + port);
var sio = require("socket.io").listen(server);
//using twit filter all the tweets that contain love or hate keyword
var stream = T.stream("statuses/filter", { track: ["love", "hate"] })
//Global counters for love and hate
var loveCounter =0;
var hateCounter =0;
//Receive the stream data from twitter and increment the global counters accordingly.
//This is done globally so that all the clients receive the current statistics on the
//server
stream.on("tweet", function (tweet) {
    var currentTweet = tweet.text;
    //cehck for love/hate tweet
    if (currentTweet.toLowerCase().indexOf("love") >= 0) {
        loveCounter++;
    } else if (currentTweet.toLowerCase().indexOf("hate") >= 0) {
        hateCounter++;
    }
   //console.log(tweet.text)
})
//Invokes this on connection from client
sio.sockets.on("connection", function(socket){
console.log("Web client connected");
//On every connection from client , we invoked twit
//stream so that all filtered tweets are collecetd.
stream.on("tweet", function (tweet) {
   var currentTweet = tweet.text;
   var currentState = "love";
    //Check if tweet contains love
    if (currentTweet.toLowerCase().indexOf("love") >= 0) {
        currentState = "love";
        //send all essential inforamtion to the client using emit.We send username,tweet text,counters and type of tweet(love or hate)
         socket.emit("tweet", {user: tweet.user.screen_name,text: tweet.text,
         loveCounter:loveCounter,hateCounter:hateCounter,currentState:currentState});
    } else if (currentTweet.toLowerCase().indexOf("hate") >= 0) {
        currentState = "hate";
        //send all essential inforamtion to the client using emit.We send username,tweet text,counters and type of tweet(love or hate)
      socket.emit("tweet", {user: tweet.user.screen_name,text: tweet.text,
      loveCounter:loveCounter,hateCounter:hateCounter,currentState:currentState});
    }
   //console.log(tweet.text)
})
socket.on("disconnect", function() {
    console.log("Web client disconnected");
});
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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


module.exports = app;
