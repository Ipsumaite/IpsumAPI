var logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    sfWrapper= require('../../services/salesforceWrapper.js'),
    apiconfig = require('../../apiconfig.json');


exports.updates = function (req, res){
  var strSOQL= 'SELECT AccountId FROM Contact where Email=\'' + req.body.email +'\'';
      sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, ' looking for account ID for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
            return;
        }else{
           if (result && result.totalSize > 0) {
             logger.logMessage("Account found for user " + req.body.email);
             var tmpAccountId = result.records[0].AccountId;
             logger.logMessage("Checking " + req.body.subscriptions.length + " subscriptions for user " + req.body.email);
             var k = 0;
             req.body.subscriptions.forEach(function(subscription){
               
               logger.logMessage("Checking subscription  " + k + " of " + req.body.subscriptions.length + " for user " + req.body.email );
               var contract={};

               if (subscription.flag==1){
                 contract ={
                   AccountId: tmpAccountId,
                   Channel__c: subscription.ChannelId
                 }
                 contract.ContractTerm=subscription.ContractTerm;
                 contract.StartDate = new Date().getTime();
                 sfWrapper.CreateSubscription(contract, function (err, result) {
                   if (err){
                     logger.logError("It was not possible to create a subscripton for channel Id " + subscription.ChannelId + " for user " + req.body.email);
                   }else{
                     logger.logMessage("Created subscription for channel Id" + subscription.ChannelId + " for user " + req.body.email);
                   }
                });
                 
               }
               if (subscription.flag==2){
                 contract.Id = subscription.Id;
                 contract.SpecialTerms = 'Canceled';
                 sfWrapper.UpdateSubscription(contract, function (err, result) {
                   if (err){
                     logger.logError("It was not possible to update subscription for " + channel.Name + " for user " + req.body.email);
                   }else{
                     logger.logMessage("Updated subscription of channel " + channel.Name + " for user " + req.body.email);
                   }
                 });
               }
               k+=1;
               if (k == req.body.subscriptions.length) {
                       httpRes.resFast(res, 'subscriptions synchronization for '+req.body.email+' done!' , 200);
               }
             });
             
           }else{
              httpRes.resError(res, ' User '+ req.body.email +' does not exists', 404, { 'Content-Type': 'text/plain' });
           }
        }
      });
}


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
                    strSOQL='SELECT AccountId,ActivatedDate,Channel__c,ContractNumber, ContractTerm,CreatedDate,Description,EndDate,Id,StartDate,Status FROM Contract where AccountId = \'' + tmpAccountId + '\' AND SpecialTerms  not in (\'Canceled\')';
                    sfWrapper.querySOQL(strSOQL, function (errorSubs, resultSubs) {
                        if (errorSubs){
                            httpRes.resError(res, ' Not possible to look subscriptions for user ' + req.params.email, 400, { 'Content-Type': 'text/plain' });
                        }else{
                            strSOQL='SELECT AccountID__c,Active__c,channelcode__c,createdAt__c,description__c,Id,IsDeleted,Name,Premium__c FROM IpsumChannel__c WHERE AccountID__c NOT IN (\''+tmpAccountId+'\') AND Active__c = true AND Visible__c = true AND SpecialTerms  not in (\'Canceled\')';
                            
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
                                       ContractNumber: resultSubs.records[indexsub].ContractNumber,
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