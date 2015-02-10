exports.logMessage = function(msg){
    var now = new Date(); 
    
    var datetmp = now.getFullYear()+'-'+(now.getMonth()+1)+'-'+now.getDay(); 
        datetmp += ' '+now.getHours()+':'+now.getMinutes()+':'+now.getSeconds(); 
    console.log("-->"+datetmp + ": " +  msg);
};