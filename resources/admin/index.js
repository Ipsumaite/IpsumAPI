var express = require('express');
var app = module.exports = express(),
    logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js');

var auth  = require('./auth.js');


app.get("/ping", function(req,res){
     logger.logMessage("pinging and ponging");
     httpRes.resUsual(res, '<h4>pong</h4>', 200, {"Content-Type": "text/html"});
});

app.post("/signup", function(req,res){
    logger.logMessage("New user: " + req.body.email +" is signing up!");
    return auth.signup(req,res);
});