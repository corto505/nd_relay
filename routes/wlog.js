
/**
*  Ecritreu d'un log
*/
 exports.writeLog = function (mess,callback){
	var fs = require ('fs');
	var config = require ('./config.js').settings;
	var myLog = config.logFile //'./public/logApp.log';
 	
	var date = new Date();
	var h = date.getHours();
	if (h<10) { h = "0"+h}
	var mn = date.getMinutes();
	if (mn<10) { mn = "0"+mn}
  var jj = date.getDay();
	if (jj<10) { jj = "0"+jj}
  var mm = date.getMonth();
	if (mm<10) { mm = "0"+mm}
  
	console.log ('-  '+h+':'+mn+' ecriture dans le log');

	fs.appendFile(myLog,jj+'/'+mm+'/'+date.getFullYear()+' '+h+':'+mn+' => '+mess+'\n',function (err){
		if (err) return callback(err);
		callback(null);
	});
};