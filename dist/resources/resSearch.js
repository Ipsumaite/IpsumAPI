var url = require("url");
var edge = require('edge');


var usersentmsg = edge.func('sql', function(){/*
  select X.* from
     (
	  select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
				X.firstname + ' ' + X.lastname as receiver, 
				rank() over (partition by M.usr_src order by M.id desc) as rank_c
	  FROM [event].[messages] M
	  inner join [core].[users] U on U.id = M.usr_src
	  inner join [core].[users] X on X.id = M.usr_dst
	  where U.[login] = @login 
	  ) as X
	  where X.rank_c <= @max
	  order by X.timestamp desc
*/});
  
var userrcvmsg = edge.func('sql', function(){/*
  select X.* from
     (
          select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
                    U.firstname + ' ' + U.lastname as sender, 
				    rank() over (partition by M.usr_dst order by M.id desc) as rank_c
          FROM [event].[messages] M
          inner join [core].[users] U on U.id = M.usr_src
          inner join [core].[users] X on X.id = M.usr_dst 
          where X.[login] = @login
	  ) as X
	  where X.rank_c < @max
	  order by X.timestamp desc
*/});



var usersentmsgdt = edge.func('sql', function(){/*
  select X.* from
     (
	  select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
				X.firstname + ' ' + X.lastname as receiver, 
				rank() over (partition by M.usr_src order by M.id desc) as rank_c
	  FROM [event].[messages] M
	  inner join [core].[users] U on U.id = M.usr_src
	  inner join [core].[users] X on X.id = M.usr_dst
	  where U.[login] = @login
      and M.[timestamp] between convert(smalldatetime, @from,101 ) and convert(smalldatetime, @to ,101 )
	  ) as X
	  where X.rank_c <= @max
      order by X.timestamp desc
*/});
  
var userrcvmsgdt = edge.func('sql', function(){/*
  select X.* from
     (
          select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
                    U.firstname + ' ' + U.lastname as sender, 
				    rank() over (partition by M.usr_dst order by M.id desc) as rank_c
          FROM [event].[messages] M
          inner join [core].[users] U on U.id = M.usr_src
          inner join [core].[users] X on X.id = M.usr_dst 
          where X.[login] = @login
          and M.[timestamp] between convert(smalldatetime, @from,101 ) and convert(smalldatetime, @to ,101 )
      ) as X
	  where X.rank_c < @max
      order by X.timestamp desc
*/});


var usersentmsgdtgeo = edge.func('sql', function(){/*
  select X.* from
     (
	  select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
				X.firstname + ' ' + X.lastname as receiver, 
				rank() over (partition by M.usr_src order by M.id desc) as rank_c
	  FROM [event].[messages] M
	  inner join [core].[users] U on U.id = M.usr_src
	  inner join [core].[users] X on X.id = M.usr_dst
	  where U.[login] = @login 
      and M.[timestamp] between convert(smalldatetime, @from,101 ) and convert(smalldatetime, @to ,101 )
	  ) as X
	  where X.rank_c <= @max
      and (geography::Point(@long, @lat, 4326)).STDistance(geography::Point(X.longitude, X.latitude, 4326)) < @radius
      order by X.timestamp desc
*/});


      
var userrcvmsgdtgeo = edge.func('sql', function(){/*
  select X.* from
     (
          select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
                    U.firstname + ' ' + U.lastname as sender, 
				    rank() over (partition by M.usr_dst order by M.id desc) as rank_c
          FROM [event].[messages] M
          inner join [core].[users] U on U.id = M.usr_src
          inner join [core].[users] X on X.id = M.usr_dst 
          where X.[login] = @login
          and M.[timestamp] between convert(smalldatetime, @from,101 ) and convert(smalldatetime, @to ,101 )
      ) as X
	  where X.rank_c < @max
      and (geography::Point(@long, @lat, 4326)).STDistance(geography::Point(X.longitude, X.latitude, 4326)) < @radius
      order by X.timestamp desc
*/});


function logError(err, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Error: " + err);
    res.end("");
}


exports.sntmsg= function sntmsg(req, res) {
	console.log("Searching Last Sent Messages " + req.params.max + " ; " + req.params.login + " \n");
	var msgARRAYinfo = new Array();
	var login_tmp = req.params.login;
	var max_tmp = req.params.max;
    
	usersentmsg({login:login_tmp, max:max_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
            result.forEach(function(msg) {
				var msginfo = new Object();
				msginfo.subject = msg.subject;
				msginfo.body =msg.body;
				msginfo.timestamp =msg.timestamp;
				msginfo.latitude =msg.latitude;
				msginfo.longitude =msg.longitude;
				msginfo.receiver =msg.receiver;
				msgARRAYinfo.push(msginfo); 
            });
            
			myJSONstring = JSON.stringify(msgARRAYinfo);
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




exports.rcvmsg = function rcvmsg(req,res) {

	console.log("Reading last received messages \n");
	var smsgARRAYinfo = new Array();
    var login_tmp = req.params.login;
	var max_tmp = req.params.max;

    userrcvmsg({login:login_tmp, max:max_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(msg) {
				var msginfo = new Object();
				msginfo.subject = msg.subject;
				msginfo.body =msg.body;
				msginfo.timestamp =msg.timestamp;
				msginfo.latitude =msg.latitude;
				msginfo.longitude =msg.longitude;
				msginfo.sender =msg.sender;
				smsgARRAYinfo.push(msginfo); 
            });
			myJSONstring = JSON.stringify(smsgARRAYinfo);
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

exports.sntmsgdt= function sntmsgdt(req, res) {
	console.log("Searching Last Sent Messages with dates " + req.params.max + " ; " + req.params.login + " \n");
	var msgARRAYinfo = new Array();
	var login_tmp = req.params.login;
	var max_tmp = req.params.max;
    var from_tmp = req.params.from;
    var to_tmp = req.params.to;
    
	usersentmsgdt({login:login_tmp, max:max_tmp, from:from_tmp, to:to_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(msg) {
				var msginfo = new Object();
				msginfo.subject = msg.subject;
				msginfo.body =msg.body;
				msginfo.timestamp =msg.timestamp;
				msginfo.latitude =msg.latitude;
				msginfo.longitude =msg.longitude;
				msginfo.receiver =msg.receiver;
				msgARRAYinfo.push(msginfo); 
            });
			myJSONstring = JSON.stringify(msgARRAYinfo);
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


exports.rcvmsgdt = function rcvmsgdt(req,res) {
	
 
	console.log("Reading last received messages with dates\n");
	var smsgARRAYinfo = new Array();
    var login_tmp = req.params.login;
	var max_tmp = req.params.max;
    var from_tmp = req.params.from;
    var to_tmp = req.params.to;

    
    userrcvmsgdt({login:login_tmp, max:max_tmp, from:from_tmp, to:to_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(msg) {
				var msginfo = new Object();
				msginfo.subject = msg.subject;
				msginfo.body =msg.body;
				msginfo.timestamp =msg.timestamp;
				msginfo.latitude =msg.latitude;
				msginfo.longitude =msg.longitude;
				msginfo.sender =msg.sender;
				smsgARRAYinfo.push(msginfo); 
            });
			myJSONstring = JSON.stringify(smsgARRAYinfo);
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

exports.sntmsgdtgeo= function sntmsgdtgeo(req, res) {
	console.log("Searching Last Sent GEO Messages with dates " + req.params.lat + " ; " + req.params.radius + " \n");
	var msgARRAYinfo = new Array();
	var login_tmp = req.params.login;
	var max_tmp = req.params.max;
    var from_tmp = req.params.from;
    var to_tmp = req.params.to;
    var lat_tmp = req.params.lat;
    var long_tmp = req.params.long;
    var radius_tmp = req.params.radius; 
    
    usersentmsgdtgeo({login:login_tmp, max:max_tmp, from:from_tmp, to:to_tmp, lat:lat_tmp, long:long_tmp, radius:radius_tmp}, 
           function (error, result){

        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(msg) {
				var msginfo = new Object();
				msginfo.subject = msg.subject;
				msginfo.body =msg.body;
				msginfo.timestamp =msg.timestamp;
				msginfo.latitude =msg.latitude;
				msginfo.longitude =msg.longitude;
				msginfo.receiver =msg.receiver;
				msgARRAYinfo.push(msginfo); 
            });
			myJSONstring = JSON.stringify(msgARRAYinfo);
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


exports.rcvmsgdtgeo = function rcvmsgdtgeo(req,res) {
	
    
    console.log("Reading last received GEO messages with dates " + req.params.lat + " ; " + req.params.max + " \n");
	
	var smsgARRAYinfo = new Array();
    var login_tmp = req.params.login;
	var max_tmp = req.params.max;
    var from_tmp = req.params.from;
    var to_tmp = req.params.to;
   	var lat_tmp = req.params.lat;
    var long_tmp = req.params.long;
    var radius_tmp = req.params.radius; 
    
    
    userrcvmsgdtgeo({login:login_tmp, max:max_tmp, from:from_tmp, to:to_tmp, lat:lat_tmp, long:long_tmp, radius:radius_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(msg) {
				var msginfo = new Object();
				msginfo.subject = msg.subject;
				msginfo.body =msg.body;
				msginfo.timestamp =msg.timestamp;
				msginfo.latitude =msg.latitude;
				msginfo.longitude =msg.longitude;
				msginfo.sender =msg.sender;
				smsgARRAYinfo.push(msginfo); 
            });
			myJSONstring = JSON.stringify(smsgARRAYinfo);
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

