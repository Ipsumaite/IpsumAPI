var logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    sfWrapper= require('../../services/salesforceWrapper.js'),
    apiconfig = require('../../apiconfig.json');



exports.readmychannels = function ChannelRead(req, res){
    
    var strSOQL= 'SELECT AccountId FROM Contact where Email=\'' + req.params.email +'\'';
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, ' looking for account ID for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
            return;
        }
        else{
           if (result && result.totalSize > 0) {
                    var tmpAccountId = result.records[0].AccountId;
                    strSOQL='SELECT Active__c,description__c,Id,Name,Premium__c,Visible__c FROM IpsumChannel__c where AccountID__c = \'' + tmpAccountId + '\' AND isDeleted__c=false';
                    sfWrapper.querySOQL(strSOQL, function (errorFinal, resultFinal) {
                        if (errorFinal){
                            httpRes.resError(res, ' Not possible to look channels for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
                        }else{
                            var channels = [];
                            channels.totalSize=resultFinal.totalSize;
                            if (resultFinal.totalSize > 0){
                              var k =0;
                              resultFinal.records.forEach(function(record){
                                 var channel ={
                                   "Active": record.Active__c,
                                   "Description": record.description__c,
                                   "AccountId": tmpAccountId,
                                   "Name": record.Name,
                                   "Id": record.Id,
                                   "Premium": record.Premium__c,
                                   "Visible": record.Visible__c
                                };
                                channels.push(channel);
                              });
                            }
                            var payload = {
                              "totalSize": resultFinal.totalSize,
                              "channels": channels
                            };
                            httpRes.resFast(res, payload , 200);
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
    

    var strSOQL= 'SELECT AccountId FROM Contact where Email=\'' + req.body.email +'\'';
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, ' looking for account ID for user ' + req.body.email, 400, { 'Content-Type': 'text/plain' });
            return;
        }
        else{
            if (result && result.totalSize > 0) {
                logger.logMessage("Account found for user " + req.body.email);
                var tmpAccountId = result.records[0].AccountId;
                logger.logMessage("Checking " + req.body.channels.length + " channels for user " + req.body.email);
                var k = 0;
                req.body.channels.forEach(function(channel){
                    logger.logMessage("Checking channel " + channel.Name + " for user " + req.body.email);

                    var params ={
                        "Active__c": channel.Active,
                        "description__c": channel.Description,
                        "AccountId__c": tmpAccountId,
                        "Name": channel.Name,
                        "Premium__c": channel.Premium,
                        "Visible__c": channel.Visible
                    };
                    if (1==channel.flag){ // Creates New Channel

                        sfWrapper.CreateChannel(params, function (err, result) {
                            if (err){
                                logger.logError("It was not possible to create channel " + channel.Name + " for user " + req.body.email);
                            }else{
                                logger.logMessage("Created channel " + channel.Name + " for user " + req.body.email);
                            }
                        });
                   }

                   if (2==channel.flag || 3==channel.flag){ // Updates Channel
                     
                      var params2 ={
                        "Active__c": channel.Active,
                        "description__c": channel.Description,
                        "AccountId__c": tmpAccountId,
                        "Name": channel.Name,
                        "Premium__c": channel.Premium,
                        "Visible__c": channel.Visible,
                        "Id":channel.Id
                    };
                     
                      if (2==channel.flag) {
                       params2.isDeleted__c = true;
                     }
                        sfWrapper.UpdateChannel(params2, function (err, result) {
                            if (err){
                                logger.logError("It was not possible to update channel " + channel.Name + " for user " + req.body.email);
                            }else{
                                logger.logMessage("Updated channel " + channel.Name + " by user " + req.body.email);
                            }
                        });
                   }

                       
                   k+=1;
                   if (k == req.body.channels.length) {
                       httpRes.resFast(res, 'Channels synchronization for '+req.body.email+' done!' , 200);
                   }
                });
                
            }
            else {
                httpRes.resError(res, ' User '+ req.body.email +' does not exists', 404, { 'Content-Type': 'text/plain' });
            }

            return;
        }
    });
    
    

        
}


