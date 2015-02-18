var express = require('express');
var app = module.exports = express(),
    logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js');


var mychannels  = require('./mychannels.js');


app.get("/api/mychannels/:email", function(req,res){
    logger.logMessage("Reading Channels for user:" + req.params.email);
    return mychannels.readmychannels(req, res);
});


app.post("/api/mychannels", function(req,res){
    logger.logMessage("Updating channels for user:" + req.body.email);
    return mychannels.syncmychannels(req, res);
});