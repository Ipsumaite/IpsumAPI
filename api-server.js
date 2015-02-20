// NPM packages
var express = require('express'),
    app = express(),
    fs = require('fs'),
    jwt = require('jwt-simple'),
    bodyParser = require('body-parser');

//API Requires
var logger = require('./services/logger.js'),
    NPMinstall = require('./package.json'),
    httpRes = require('./services/HTTPresponse.js') ;


app.set('tokenttl',(process.env.apitokenttl || 3600)); //default is 1h (3600s) 
app.set('port', (process.env.PORT || process.env.apiport));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
    extended: true
}));
app.use(express.static("/"));
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});



// #####################################################################################################
// #####################################################################################################
// Get Resources
app.all("/api/*", function(req, res, next){
    logger.logMessage("Calling an API CRM secured resource...");
     if (!req.headers.authorization || undefined == req.headers.authorization ){
        logger.logError(" Refusing for not being authorized from host:" + req.hostname);
        return res.status(301).send({message: 'You are not authorized to access this resource, please authenticate yourself'});
     }else{
        // Testing token validation
        try {
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, process.env.apikey);
        } catch(err){
            logger.logError( ' Wrong token, please authenticate again.');
            return res.status(301).send({message: ' Wrong token, please authenticate again.'});
        }
        timediff = Math.round((Date.now()-payload.seed)/1000);
        if (timediff <= app.get('tokenttl')){
            logger.logMessage(" Token approved from:" + req.hostname);
            next();
        }else{
            logger.logMessage(" Expired token from " + req.hostname);
            return res.status(301).send({message: 'Expired token, please authenticate again.'});
        }
     }
});


//load resources
var admin = require('./resources/admin/index.js');
app.use(admin);

var channels = require('./resources/channels/index.js');
app.use(channels);



// All Routes ###################################################################################################
app.all("*", function(req,res){
    httpRes.resError(res, "Wrong  Request to a Wrong Resource", 200, {"Content-Type": "text/html"});
});


// ################################################################################################################
app.listen(app.get('port'), function(){
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple("        Starting" );
    logger.logMessageSimple(" ###                                   #    ######  ### ");
    logger.logMessageSimple("  #  #####   ####  #    # #    #      # #   #     #  #  ");
    logger.logMessageSimple("  #  #    # #      #    # ##  ##     #   #  #     #  #  ");
    logger.logMessageSimple("  #  #    #  ####  #    # # ## #    #     # ######   #  ");
    logger.logMessageSimple("  #  #####       # #    # #    #    ####### #        #  ");
    logger.logMessageSimple("  #  #      #    # #    # #    #    #     # #        #  ");
    logger.logMessageSimple(" ### #       ####   ####  #    #    #     # #       ### ");
 
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple(" Version: "+NPMinstall.version);
    logger.logMessageSimple(" Current Developer:" + NPMinstall.author);
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple(" Listening on port " + app.get('port'));
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
    logger.logMessageSimple("-----------------------------------------------------------------------------------");
});