var logger = require('../../services/logger.js'),
    httpRes = require('../../services/HTTPresponse.js'),
    sfWrapper= require('../../services/salesforceWrapper.js'),
    Firebase = require('firebase'),
    apiconfig = require('../../apiconfig.json');

exports.presence=function (req, res) {

    var strSOQL = "SELECT AccountId FROM Contact where Email =\'" + req.body.email + "\' ";
    sfWrapper.querySOQL(strSOQL, function (error, result) {
        if (error) { 
            httpRes.resError(res, 'Unkown error checking login '+req.body.email+', please contact System Administrator', 404, { 'Content-Type': 'text/plain' });
            return;
        }
        if (result && result.totalSize > 0) {
            var myRef = new Firebase(process.env.FIREBASEURL+"/streams/"+result.records[0].AccountId+"/beacon");
            myRef.once("value", function(snapshot) {
              if (snapshot.val()){
                var json = snapshot.val();
                for (var key in json) {
                     myRef.child(key).remove();
                }
              }else{
                logger.logMessage(" New stream for user "+req.body.email);
              }
              if (req.body.latitude !== undefined && req.body.longitude !== undefined){
                myRef.push({
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    date: Firebase.ServerValue.TIMESTAMP,
                    email: req.body.email
                });
              }else{
                 httpRes.resError(res, 'Please consider all the necessary fields for this request ' + req.params.email, 404, { 'Content-Type': 'text/plain' });
              }
              
            }, function (errorObject) {
                  console.log("The read failed: " + errorObject.code);
            });
            httpRes.resFast(res, "{\"message\":\"User "+ req.body.email +" registered\"}", 200);
          
        }
        else {
            httpRes.resError(res, 'Login not found for ID return for user ' + req.params.email, 404, { 'Content-Type': 'text/plain' });
        }
    });
    return;
}

