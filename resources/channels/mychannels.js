var logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    sfWrapper= require('../../services/salesforceWrapper.js'),
    apiconfig = require('../../apiconfig.json');



exports.readmychannels = function(req, res){
    
    var strSOQL= 'SELECT AccountId FROM Contact where Email=\'' + req.params.email +'\'';
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, ' looking for account ID for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
            return;
        }
        else{
            if (result && result.totalSize > 0) {
                    var tmpAccountId = result.records[0].AccountId;
                    strSOQL='SELECT Active__c,description__c,Id,Name,Premium__c,Visible__c FROM IpsumChannel__c where AccountID__c = \'' + tmpAccountId + '\'';
                    sfWrapper.querySOQL(strSOQL, function (errorFinal, resultFinal) {
                        if (errorFinal){
                            httpRes.resError(res, ' Not possible to look channels for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
                        }else{
                            httpRes.resFast(res, resultFinal , 200);
                        }
                    });
                    return;
            }
            else {
                httpRes.resError(res, 'Error, User '+ req.params.email +' does not exists', 404, { 'Content-Type': 'text/plain' });
            }

            return;
        }
    });
}


exports.syncmychannels = function(req,res){
    
    console.log("Email " + req.body.email);
    var strSOQL= 'SELECT AccountId FROM Contact where Email=\'' + req.body.email +'\'';
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, ' looking for account ID for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
            return;
        }
        else{
            if (result && result.totalSize > 0) {
                    var tmpAccountId = result.records[0].AccountId;
                    strSOQL='SELECT Active__c,description__c,Id,Name,Premium__c,Visible__c FROM IpsumChannel__c where AccountID__c = \'' + tmpAccountId + '\'';
                    sfWrapper.querySOQL(strSOQL, function (errorFinal, resultFinal) {
                        if (errorFinal){
                            httpRes.resError(res, ' Not possible to look channels for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
                        }else{
                            // Check Deleted Channels
                            
                            
                            // Check Channels changes
                            
                            
                                                        
                            // Check New Channels
                            
                                                        
                            
                            httpRes.resFast(res, req.body , 200);
                        }
                    });
                    return;
            }
            else {
                httpRes.resError(res, 'Error, User '+ req.params.email +' does not exists', 404, { 'Content-Type': 'text/plain' });
            }

            return;
        }
    });
    
    
    httpRes.resFast(res, req.body, 200);
        
}


