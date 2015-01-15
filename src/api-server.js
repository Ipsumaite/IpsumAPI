// Paypal method form server

var express = require('express'),
    app = express(),
    fs = require('fs');

var appPort = 3000;

var APIresources=require('./resources/resGeneral.js');
var WritingMsgresources=require('./resources/resWriting.js');
var SearchMsgresources=require('./resources/resSearch.js');
var Deviceresources=require('./resources/resDevice.js');

// Important for post request
var bodyParser = require('body-parser')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


// Get Resources
app.get("/sntmsg/:login/:max/:from/:to/:lat/:long/:radius", SearchMsgresources.sntmsgdtgeo);
app.get("/rcvmsg/:login/:max/:from/:to/:lat/:long/:radius", SearchMsgresources.rcvmsgdtgeo);
app.get("/userdetailsbyId/:from-:to", APIresources.read_users);
app.get("/lastusersndmsg/:login", APIresources.read_last_sent_messages);
app.get("/lastsndmsgv2", APIresources.read_last_sent);
app.get("/lastuserrcvmsg/:login", APIresources.read_last_received_messages);
app.get("/userdetailbylogin/:login", APIresources.userdetailbyLogin);
app.get("/userdetailbyId/:id", APIresources.userdetailbyId);
app.get("/sntmsg/:login/:max", SearchMsgresources.sntmsg);
app.get("/rcvmsg/:login/:max", SearchMsgresources.rcvmsg);
app.get("/sntmsg/:login/:max/:from&:to", SearchMsgresources.sntmsgdt);
app.get("/rcvmsg/:login/:max/:from&:to", SearchMsgresources.rcvmsgdt);

// POST Resources
app.post("/sendmsg", WritingMsgresources.sendmsg);
app.post("/meas", Deviceresources.postmeas);

app.post("/ping", function(req,res){
     console.log("pinging and ponging:"+ req.body.message);
     res.writeHeader(200, {"Content-Type": "text/html"});
     res.end();
}
);

app.get("*", function(req,res){
    res.writeHeader(200, {"Content-Type": "text/html"});
    res.write("Ipsum API active");
    res.end();
});

app.listen(appPort, function(){
    console.log("Listening on port " + appPort);   
});