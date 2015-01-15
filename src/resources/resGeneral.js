var url = require("url");
var edge = require('edge');


var getTopUsers = edge.func('sql', function () {/*
    SELECT  top 100 firstname, lastname, email, login, id FROM core.users
    where id between @from and @to
    order by id
*/});

var getTopUsersLogin = edge.func('sql', function () {/*
    SELECT  top 100 firstname, lastname, email, login, id FROM core.users
    where login = @login
    order by id
*/});

var getLastSentMessages = edge.func('sql', function(){/*
  select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
			X.firstname + ' ' + X.lastname as receiver
  FROM [event].[messages] M
  inner join [core].[users] U on U.id = M.usr_src
  inner join [core].[users] X on X.id = M.usr_dst
  where U.[login] = @login
  order by timestamp desc
*/});

var getLastSentMessagesv2 = edge.func('sql', function(){/*
select X.[subject], X.[body], X.[timestamp], X.[latitude], X.[longitude],
   X.[receiver], X.total_sent, X.total_received,
   rank() over (partition by 'test' order by X.id desc) as [row_number]
 from
(
	select top 20 M.[subject], M.[body], M.[timestamp] , M.[latitude], M.[longitude], 
			X.firstname + ' ' + X.lastname as receiver, Y.total_sent, Z.total_received, M.id
	FROM [event].[messages] M
	inner join [core].[users] U on U.id = M.usr_src
	inner join [core].[users] X on X.id = M.usr_dst
	inner join  (
				select A.usr_src, count(*) as  total_sent
				from [event].[messages] A
				group by A.usr_src
			  ) as Y ON Y.usr_src  = M.usr_src
	inner join  (
				select A.usr_dst, count(*) as  total_received
				from [event].[messages] A
				group by A.usr_dst
			  ) as Z ON Z.usr_dst  = M.usr_dst
	order by M.id desc
) as X

*/});
  
var getLastReceivedMessages = edge.func('sql', function(){/*
  select top 100 M.[subject], M.[body], M.[timestamp], M.[latitude], M.[longitude], 
			U.firstname + ' ' + U.lastname as sender
  FROM [event].[messages] M
  inner join [core].[users] U on U.id = M.usr_src
  inner join [core].[users] X on X.id = M.usr_dst 
  where X.[login] = @login
  order by timestamp desc
*/});


function logError(err, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Error: " + err);
    res.end("");
}


exports.read_last_sent_messages= function read_last_sent_messages(req, res) {

	console.log("Reading Last Sent Messages \n");
	var msgARRAYinfo = new Array();
	var login_tmp = req.params.login;

	
	//var maxmsg_tmp = req.params.maxmsg;
    getLastSentMessages({login:login_tmp}, function (error, result) {
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

exports.read_last_sent= function read_last_sent(req, res) {


	console.log("Reading Last Sent Messages Total Users \n");
	var msgARRAYinfo = new Array();
	var login_tmp = "";

	
	//var maxmsg_tmp = req.params.maxmsg;
    getLastSentMessagesv2({login:login_tmp}, function (error, result) {
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
                msginfo.total_sent =msg.total_sent;
                msginfo.total_received =msg.total_received;
                msginfo.row_number =msg.row_number;
				msgARRAYinfo.push(msginfo); 
            });
			myJSONstring = "{" + String.fromCharCode(34) + "msg" +String.fromCharCode(34) + ":"+ JSON.stringify(msgARRAYinfo) +"}";
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

exports.read_last_received_messages = function read_last_received_messages(req,res) {


	console.log("Reading last received messages \n");
	var smsgARRAYinfo = new Array();
	var login_tmp = req.params.login;
	var max_tmp = 100;
	
	//var maxmsg_tmp = req.params.maxmsg;
    getLastReceivedMessages({login:login_tmp}, function (error, result) {
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



exports.userdetailbyId = function userdetailbyId(req, res) {

	console.log("Reading User detail by ID \n");
	
	var userARRAYinfo = new Array();
    var from_tmp = req.params.id;
     
    getTopUsers({from:from_tmp, to:from_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(user) {
				var userinfo = new Object();
				userinfo.firstname = user.firstname;
				userinfo.lastname =user.lastname;
				userinfo.email =user.email;
				userinfo.login =user.login;
				userinfo.id =user.id;
				userARRAYinfo.push(userinfo); 
            });
			myJSONstring = JSON.stringify(userARRAYinfo);
	        res.writeHead(200, { 'Content-Type': 'application/json' });
            res.write(myJSONstring);
            res.end(); 
        }
        else {
            res.end("No results");
        }
    });
}

exports.userdetailbyLogin= function userdetailbyLogin(req, res) {


	console.log("Reading User Detail by login \n");
	
	var userARRAYinfo = new Array();
    var login_tmp = req.params.login;
     
    getTopUsersLogin({login:login_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(user) {
				var userinfo = new Object();
				userinfo.firstname = user.firstname;
				userinfo.lastname =user.lastname;
				userinfo.email =user.email;
				userinfo.login =user.login;
				userinfo.id =user.id;
				userARRAYinfo.push(userinfo); 
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
			myJSONstring = JSON.stringify(userARRAYinfo);
			res.write(myJSONstring);
            res.end(); 
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end("No results");
        }
    });
}

exports.read_users=function read_users(req, res) {

	console.log("Reading top N users according userID range \n");
	var userARRAYinfo = new Array();
    var from_tmp = req.params.from;
    var to_tmp = req.params.to;
    
    getTopUsers({from:from_tmp, to:to_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
        if (result) {
			//res.write(JSON.stringify({error:null})+"\n");
            result.forEach(function(user) {
				var userinfo = new Object();
				userinfo.firstname = user.firstname;
				userinfo.lastname =user.lastname;
				userinfo.email =user.email;
				userinfo.login =user.login;
				userinfo.id =user.id;
				userARRAYinfo.push(userinfo); 
            });
			myJSONstring = JSON.stringify(userARRAYinfo);
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


exports.read_points=function read_points(req, res){
   res.write("Login " + req.params.login + " Dist " + req.params.dist +"\n");
   res.end("Testing GET method");
}
