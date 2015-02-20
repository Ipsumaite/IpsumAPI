var winston = require('winston'),
    Papertrail = require('winston-papertrail').Papertrail;
    os = require('os');
 
var logger,
    consoleLogger = new winston.transports.Console({
        level: 'debug',
        timestamp: function() {
            return new Date().toString();
        },
        colorize: true
    }),
    ptTransport = new Papertrail({
        host: process.env.loggerhost,
        port: process.env.loggerport,
        colorize: true,
        hostname: os.hostname(),
        level: 'debug',
        logFormat: function(level, message) {
            return '[' + level + '] ' + message;
        }
    });
 
ptTransport.on('error', function(err) {
    logger && logger.error(err);
});
 
ptTransport.on('connect', function(message) {
    logger && logger.info(message);
});
 
var logger = new winston.Logger({
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    },
    transports: [
        ptTransport//,
        //consoleLogger
    ]
});


exports.logMessage = function(msg){
    var d = new Date();
    logger.info(msg + ':' + d.toJSON());
};

exports.logMessageSimple = function(msg){
    logger.info(msg);
};

exports.logError = function(msg){
    var d = new Date();
    logger.error(msg + ':' + d.toJSON());
};


exports.logWarning = function(msg){
    var d = new Date();
    logger.warn(msg + ':' + d.toJSON());
};


exports.logDebug = function(msg){
    var d = new Date();
    logger.debug(msg + ':' + d.toJSON());
};