var express = require('express');
var app = module.exports = express(),
    logger = require('../../services/logger.js'),
    contents = require('./contents.js'),
    httpRes = require('../../services/HTTPresponse.js');

app.get("/api/contentURL", function(req,res){
     logger.logMessage("Reading Content URL");
     var URL = {
       "url":process.env.FIREBASEURL
     }
     httpRes.resFast(res, URL, 200);
});

app.post("/api/presence", function(req,res){
     logger.logMessage("Signals presence for user "+req.body.email);
     return contents.presence(req,res);
});