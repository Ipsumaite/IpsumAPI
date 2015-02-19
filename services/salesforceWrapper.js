var sf = require('node-salesforce');
var logger = require('./logger.js');


var sfconfig = {
    user: process.env.SFuser,
    token: process.env.SFpassword+process.env.SFtoken
};

function SOQLquery(SOQL, callback){
    var conn = new sf.Connection({});
    conn.login(sfconfig.user, sfconfig.token, function(err) {
        if (err) { return console.error(err); }
        conn.query(SOQL, function(err, result) {
            if (err) {
                logger.logError(err);
                callback(err); 
            }else{
                callback(null, result);
            }
        });
    });
}


// Generates Codes
function randString(x){
    var s = "";
    while(s.length<x&&x>0){
        var r = Math.random();
        s+= (r<0.1?Math.floor(r*100):String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65)));
    }
    return s;
}

exports.querySOQL = SOQLquery;


exports.createAccount = function(params, callback){
    var accountparams = {
        Name: params.email,
        Phone: params.userinfo.phone,
        BillingStreet: params.userinfo.address
    };
  
    var conn = new sf.Connection({});
    conn.login(sfconfig.user, sfconfig.token, function(err, userInfo) {
        if (err) { callback(err);  }
        conn.sobject("Account").create(accountparams, function(err, result) {
            if (err) {
                logger.logError(err);
                callback(err); 
            }else{
                var strSOQL = ' SELECT Id, Name, Phone FROM Account where Name=\''  + params.email + '\'';
                SOQLquery(strSOQL, function (error, result) {
                    if (error) { 
                          httpRes.resError(res, 'Unkown error checking user existence, please contact System Administrator', 400, { 'Content-Type': 'text/plain' });
                          callback(error);
                    }
                    if (result.totalSize >0) { // We have an account lets create the contact
                        var contactparams = {
                            AccountId: result.records[0].Id,
                            Email: params.email,
                            Phone: params.userinfo.phone,
                            FirstName: params.userinfo.firstname,
                            LastName: params.userinfo.lastname,
                            MailingStreet: params.userinfo.address,
                            User_Name__c: params.email,
                            Password__c: params.passwordhash
                        };
                        conn.sobject("Contact").create(contactparams, function(err, result) {
                            if (err){
                                logger.logError(err);
                                callback(err);
                            }
                            else{
                                var channelparams = {
                                     AccountID__c: contactparams.AccountId, 
                                     channelcode__c: randString(20),
                                     Active__c: true,
                                     Premium__c: false,
                                     Visible__c: false,
                                     Name:  params.userinfo.firstname + ' ' + params.userinfo.lastname + ' channel'
                                };
                                conn.sobject("IpsumChannel__c").create(channelparams, function(err, result) {
                                    if (err){
                                        logger.logError(err);
                                        callback(err);
                                    }else
                                        callback(null, result);
                                });
                            }
                            return;
                        });
                    }
                });
            }
         });
                
    });
}

exports.CreateChannel=function(params, callback){
    
    var conn = new sf.Connection({});
    params.channelcode__c=randString(20);
    conn.login(sfconfig.user, sfconfig.token, function(err, userInfo) {
        if (err) {
            logger.logMessage(err);
            callback(err);  
        }else{
            conn.sobject("IpsumChannel__c").create(params, function(err, result) {
                    if (err){
                            logger.logError(err);
                            callback(err);
                    }else
                            callback(null, result);
            });
        }
    });
}


exports.DeleteChannel=function(params, callback){
    var conn = new sf.Connection({});
    conn.login(sfconfig.user, sfconfig.token, function(err, userInfo) {
        if (err) {
            logger.logMessage(err);
            callback(err);  
        }else{
            conn.sobject("IpsumChannel__c").destroy(params.Id, function(err, ret) {
                    if (err){
                            logger.logError(err);
                            callback(err);
                    }else
                            callback(null, result);
            });
        }
    });
}


exports.UpdateChannel=function(params, callback){
    var conn = new sf.Connection({});
    conn.login(sfconfig.user, sfconfig.token, function(err, userInfo) {
        if (err) {
            logger.logMessage(err);
            callback(err);  
        }else{
            conn.sobject("IpsumChannel__c").update(
                params, 
                function(err, result) {
                    if (err){
                        logger.logError(err);
                        callback(err);
                    }else
                        callback(null, result);
                });
        }
    });
}




