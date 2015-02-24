var express = require('express');
var app = module.exports = express(),
    logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js');

app.get("/api/contentURL", function(req,res){
     logger.logMessage("Reading Content URL");
     var URL = {
       "url":process.env.FIREBASEURL
     }
     httpRes.resFast(res, URL, 200);
});
