//Service to reply to HTTP request
var logger = require('./logger.js');

exports.resError = function (res, msg, errorCode, Content) {
    var now = new Date(); 
    var datetmp = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDay(); 
        datetmp += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 
    
    logger.logMessage(msg);
    try{
        res.writeHead(errorCode, Content);
        res.write(datetmp + ", Error ");
        res.write(msg);
        res.end("");
    } catch(err){
            return res.status(301).send({message: ' There was an error processing your request'});
    }
}

exports.resUsual = function (res, msg, resCode, Content) {
    res.writeHead(resCode, Content);
    res.write(msg);
    res.end("");
}

exports.resFast = function(res, msg, resCode){
     res.status(resCode).send(msg);
}