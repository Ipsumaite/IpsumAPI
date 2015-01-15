var url = require("url");
var edge = require('edge');

var InsertMessage = edge.func('sql', function(){/*
  INSERT INTO [event].[messages]
           ([usr_src], [usr_dst], [subject]  ,[body] ,[timestamp]  ,[latitude] ,[longitude])
  Values (@src, @dst, @subject, @body, convert(smalldatetime,getdate()),@lat, @long)
*/});

function logError(err, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Error: " + err);
    res.end("");
}


exports.sendmsg= function sendmsg(req, res) {
    
	console.log("Posting a message from "+ req.body.src + " \n");
	
	
    var src_tmp = req.body.src;
    var dst_tmp = req.body.dst;
    var subject_tmp = req.body.subject;
    var body_tmp = req.body.body;
    var lat_tmp = req.body.lat;
    var long_tmp = req.body.long;

    
    InsertMessage({src:src_tmp, dst:dst_tmp, subject:subject_tmp, body:body_tmp, lat:lat_tmp, long:long_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			myJSONstring = "done";
            res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(myJSONstring);
            res.end(); 
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end("No results");
        }
    });
    
}