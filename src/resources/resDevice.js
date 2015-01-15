var url = require("url");
var edge = require('edge');



var InsertMeasurement = edge.func('sql', function(){/*
INSERT INTO [dbo].[DeviceSensors]
           ([tag], [aX] ,[aY] ,[aZ]  ,[mX]  ,[mY]  ,[mZ] ,[gX] ,[gY]  ,[gZ])
  Values (@tag, @aX, @aY, @aZ, @mX, @mY, @mZ, @gX, @gY, @gZ)
*/});

function logError(err, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write("Error: " + err);
    res.end("");
}


exports.postmeas= function postmeas(req, res) {


	console.log("Posting a measurement "+ req.body.tag+ " \n");
	console.log("Acceloremter " + req.body.aX + " " + req.body.aY+ " " +req.body.aZ + " \n");
    console.log("Magneto " + req.body.mX + " " + req.body.mY+ " " +req.body.mZ + " \n");
    console.log("Galva " + req.body.gX + " " + req.body.gY+ " " +req.body.Z + " \n");
	
    var tag_tmp = req.body.tag;
    var aX_tmp = req.body.aX;
    var aY_tmp = req.body.aY;
    var aZ_tmp = req.body.aZ;
    var mX_tmp = req.body.mX;
    var mY_tmp = req.body.mY;
    var mZ_tmp = req.body.mZ;
    var gX_tmp = req.body.gX;
    var gY_tmp = req.body.gY;
    var gZ_tmp = req.body.gZ;

    
    InsertMeasurement({tag:tag_tmp, aX:aX_tmp, aY:aY_tmp, aZ:aZ_tmp, 
                        mX:mX_tmp, mY:mY_tmp, mZ:mZ_tmp,
                        gX:gX_tmp, gY:gY_tmp, gZ:gZ_tmp}, function (error, result) {
        if (error) { logError(error, res); return; }
            res.writeHead(200, { 'Content-Type': 'application/json' });
        if (result) {
			myJSONstring = "done";
			res.write(myJSONstring);
            res.end(); 
        }
        else {
            res.end("No results");
        }
    });
    
}