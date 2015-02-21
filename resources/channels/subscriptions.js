var logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    sfWrapper= require('../../services/salesforceWrapper.js'),
    apiconfig = require('../../apiconfig.json');




exports.readAll = function (req, res){
    
      
    var strSOQL= 'SELECT AccountId FROM Contact where Email=\'' + req.params.email +'\'';
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, ' looking for account ID for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
            return;
        }
        else{
            if (result && result.totalSize > 0) {
                    var tmpAccountId = result.records[0].AccountId;
                    strSOQL='SELECT AccountId,ActivatedDate,Channel__c,ContractTerm,CreatedDate,Description,EndDate,Id,StartDate,Status FROM Contract where AccountId = \'' + tmpAccountId + '\'';
                    sfWrapper.querySOQL(strSOQL, function (errorSubs, resultSubs) {
                        if (errorSubs){
                            httpRes.resError(res, ' Not possible to look subscriptions for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
                        }else{
                            strSOQL='SELECT AccountID__c,Active__c,channelcode__c,createdAt__c,description__c,Id,IsDeleted,Name,Premium__c FROM IpsumChannel__c WHERE AccountID__c NOT IN (\''+tmpAccountId+'\') AND Active__c = true AND Visible__c = true ';
                            
                            sfWrapper.querySOQL(strSOQL, function(errorCh, resultCh){
                              if (errorCh){
                                httpRes.resError(res, ' Not possible to look channels for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
                              }else{
                                var channels = [];
                                var channel;
                                for (k=0; k < resultCh.totalSize;k++){
                                  var already_subscribed = false;
                                  var indexsub = 0;
                                  console.log("Checking Channel " + resultCh.records[k].Name);
                                  for (l=0; l< resultSubs.totalSize; l++) 
                                    if(resultSubs.records[l].Channel__c == resultCh.records[k].Id){
                                      already_subscribed = true; //This channel is already subscribed
                                      indexsub = l;
                                    }
                                   channel={
                                     Name: resultCh.records[k].Name,
                                     Description: resultCh.records[k].description__c,
                                     Subscribed: already_subscribed,
                                     Id: resultCh.records[k].Id,
                                     Premium: resultCh.records[k].Premium__c                              
                                   };
                                   if (already_subscribed)
                                     channel.Subscription ={
                                       Id: resultSubs.records[indexsub].Id,
                                       ContractTerm: resultSubs.records[indexsub].ContractTerm,
                                       CreatedDate: resultSubs.records[indexsub].CreatedDate,
                                       Description: resultSubs.records[indexsub].Description,
                                       EndDate: resultSubs.records[indexsub].EndDate,
                                       StartDate: resultSubs.records[indexsub].StartDate,
                                       Status: resultSubs.records[indexsub].Status
                                     };
                                  channels.push(channel)
                                }
                                httpRes.resFast(res, channels , 200);
                              }
                              
                            });
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