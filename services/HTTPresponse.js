//Service to reply to HTTP request
var logger = require('./logger.js');

exports.resError = function (res, msg, errorCode, Content) {
    var now = new Date(); 
    var datetmp = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDay(); 
        datetmp += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 
    
    logger.logError(msg);
    try{
        res.writeHead(errorCode, Content);
        res.write(datetmp + ", Error ");
        res.write(msg);
        res.end("");
    } catch(err){
            logger.logError(err);
             return res.status(301).send({message: ' There was an error processing your request'});
    }
}

exports.resUsual = function (res, msg, resCode, Content) {
    logger.logMessage(msg);
    res.writeHead(resCode, Content);
    res.write(msg);
    res.end("");
}

exports.resFast = function(res, msg, resCode){
     logger.logMessage(msg);
     res.status(resCode).send(msg);
}