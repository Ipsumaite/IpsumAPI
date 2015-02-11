var bcrypt = require('bcrypt-nodejs'),
    jwt = require('jwt-simple'),
    logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    sfWrapper= require('../../services/salesforceWrapper.js'),
    apiconfig = require('../../apiconfig.json');
    
    

// Accepts for test just this email list
var emaillist = null;
if (undefined !=  process.env.emaillist){
    emaillist = JSON.parse(process.env.emaillist);
}

function tokenFactory(req){
    var payload = {
                     iss: req.hostname,
                     sub: req.body.email,
                     seed: Date.now()
    };
    return jwt.encode(payload, process.env.apikey);
}


exports.SFping = function(req, res){
    var strSOQL= 'SELECT id FROM Account limit 1';
    
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, 'Testing Salesforce Connectivity', 400, { 'Content-Type': 'text/plain' });
            return;
        }
        else{
            res.status(200).send(result.done);
        }
    });
        
}

//######################################################################################################3
//signup
exports.signup=function (req, res) {
    
    var params = {
        email: req.body.email,
        password: req.body.password,
        passwordhash: 'No password',
        userinfo: JSON.parse(req.body.user)
    };

    if (req.body.password == undefined || req.body.email == undefined || params.userinfo.firstname == undefined
        || params.userinfo.lastname == undefined || params.userinfo.phone == undefined || params.userinfo.address == undefined){
        httpRes.resError(res, 'Check the required fields please to progress on this request', 404, { 'Content-Type': 'text/plain' });
        return;
    }
    var passwd=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;  
    if (JSON.stringify(req.body.password).length < apiconfig.pwdlength.min ||  JSON.stringify(req.body.password).length > apiconfig.pwdlength.max
        || !req.body.password.match(passwd)){
        httpRes.resError(res, 'Check your password please, length must be between '+ apiconfig.pwdlength.min+' and '+ apiconfig.pwdlength.max+' and contain special characters', 406, { 'Content-Type': 'text/plain' });
        return;
    
    }
   
    params.passwordhash = bcrypt.hashSync(params.password,bcrypt.genSaltSync(10));
    params.channelcode = bcrypt.hashSync(params.email, bcrypt.genSaltSync(10)).substring(1, 10);
    
    var strSOQL = ' SELECT Id, Name, Phone FROM Account where Name=\''  + params.email + '\'';
    

    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, 'Unkown error checking user existence, please contact System Administrator', 400, { 'Content-Type': 'text/plain' });
            return;
        }
        if (result) {
              if (result.totalSize> 0) {
                httpRes.resError(res, 'User already Exists', 400, { 'Content-Type': 'text/plain' });
              }else{
                 sfWrapper.createAccount(params, function (err, result) {
                        if (err) { 
                            httpRes.resError(res, 'Unkown registering error, please contact System Administrator', 401, { 'Content-Type': 'text/plain' });
                            return; 
                        }
                        if (result) {
                            var token = tokenFactory(req);
                            res.status(200).send({status: 'Authenticated', email: req.body.email, token:token});
                        }
                        else {
                            res.status(302).send('No results');
                        }
                    });
              }
        }
        else {
            httpRes.resError(res, 'Unkown Error no results checking user existence, please contact System Administrator', 401, { 'Content-Type': 'text/plain' });
            return;
        }
    });
}


//Validates Login
exports.login=function (req, res) {
    
    var params = {
        email: req.body.email,
        password: req.body.password,
        passwordhash: 'No password'
    };
    
    if (req.body.password == undefined || req.body.email == undefined){
        httpRes.resError(res, 'Check the required fields please to progress on this request', 404, { 'Content-Type': 'text/plain' });
        return;
    }

    var strSOQL = "SELECT Email,Password__c FROM Contact where Email =\'" + req.body.email + "\' ";
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, 'Unkown error checking login, please contact System Administrator', 404, { 'Content-Type': 'text/plain' });
            return;
        }
        if (result && result.records[0].Password__c!= undefined) {
            bcrypt.compare(params.password, result.records[0].Password__c, function(err, doesMatch){
                if (doesMatch){
                    var token = tokenFactory(req);
                    res.status(200).send({status: 'Authenticated', email: req.body.email, token:token});
                }else{
                    httpRes.resError(res, 'Wrong Login or password', 404, { 'Content-Type': 'text/plain' });
                }
            });
        }
        else {
            httpRes.resError(res, 'Error, User does not exists', 404, { 'Content-Type': 'text/plain' });
        }
    });
    return;
}
