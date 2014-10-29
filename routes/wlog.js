
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

/*****************************************
*  Passerelle envoi de sms
*
*****************************************/
exports.send_htc_sms = function(message,callback){

	http = require('http');
	var tel = '0689816473';  //req.param.tel
	//var message = req.params.message;

	var options = {
	  host: '192.168.0.102',
	  port: 9090,
	  path: '/sendsms?phone='+tel+'&text='+message+'&password=tedjyx33'
	};
	//console.log('xxxx - xxxx');

	http.get(options, function(reponse) {
	  
        if (reponse.statusCode ==200){
           console.log("Send Sms:  " + Date('d/M/Y h:m'));
           callback(null);
        }
  		}).on('error', function(e) {
	       console.log("Got error: " + e.message);
	       return callback(e);
	});

};

/**
* permet d'Envoyer un mail en dehors du serveur web
*
*/
exports.send_mail = function (texte){

	var nodemailer = require('nodemailer');
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: 'eric.balinfo@gmail.com',
			pass: '&HanabiGmail)'
		}
	});

	var mailOptions = {
		from: 'Automate <eric.balinfo@gmail.com>',
		to: 'em14150@free.fr',
		subject: 'Err: Ping serveur',
		text: 'Le serveur '+texte+' ne répond pas'
	}

	transporter.sendMail(mailOptions, function (error,info){
		if(error){
			console.log(error);
		}else{
			console.log('Message send : '+ info.reponse)
		}
	});
};

