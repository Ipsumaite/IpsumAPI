var express = require('express');
var app = module.exports = express(),
    logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    jwt = require('jwt-simple');

var auth  = require('./auth.js');


app.get("/ping", function(req,res){
     logger.logMessage("pinging and ponging");
     httpRes.resUsual(res, '<h4>pong</h4>', 200, {"Content-Type": "text/html"});
});

app.post("/signup", function(req,res){
    logger.logMessage("New user: " + req.body.email +" is signing up!");
    return auth.signup(req,res);
});

app.post("/login", function(req,res){
    logger.logMessage("User: " + req.body.email +" is logging");
    return auth.login(req,res);
});


app.get("/api/SFping", function(req,res){
    logger.logMessage("SF pinging and ponging");
    return auth.SFping(req, res);
});

app.get("/api/readtoken", function(req,res){
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, process.env.apikey);
    logger.logMessage("Reading Token from email "+ payload.sub);
    httpRes.resFast(res, {"email": payload.sub} , 200);
});



