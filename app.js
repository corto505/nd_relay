
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var domoticz = require('./routes/domoticz');

var http = require('http');
var path = require('path');
var allowCrossDomain = function(req,res,next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(allowCrossDomain);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//=======   ROUTES  INDEX.PHP  ===========
app.get('/', routes.index);
app.get('/test_ping', routes.test_ping);
app.get('/init_relai',routes.init_relai);
app.get('/relai/:id/:ordre/:delai', routes.cde_relai);
app.get('/sms/:message', routes.send_sms);
app.get('/led/:pins/:etat',routes.led); //affichage dune led etat = 0 ou 1
app.get('/code/:cde',routes.code_create); //Creation d'un code de controle
app.get('/code/verif/:uid/:cde/:code',routes.code_verif); //Creation d'un code de controle
app.get("/test_json",routes.lireBtnTdb); // retourne un fichier json

//=========  ROUTES DOMOTICZ  =============
app.get('/devices',domoticz.index); // menu accueil + thermo
app.get('/devices/listeinter',domoticz.listeinter); // menu accueil + thermo
app.get('/devices/update',domoticz.updatedevices); // crer un fichier spécifique json
app.get('/devices/dump',domoticz.dumpdevices); // creer un fichier json via Domoticz

app.get('/devices/file',domoticz.lirefiledevices); //en attente
app.get('/devices/sendcde/:idx/:cde',domoticz.send_cde); //envoi d'une commande a domoticz


var httpServeur =  http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//::::::::::::::::   Autres Fonctions  ::::::::::::::::::


/*  TEST 
Seconds: 0-59
Minutes: 0-59
Hours: 0-23
Day of Month: 1-31
Months: 0-11
Day of Week: 0-6
	var job = new cronJob('00 30 11 * * 1-5', function(){
    // Runs every weekday (Monday through Friday)
    // at 11:30:00 AM. It does not run on Saturday
    // or Sunday.
*/


/**
var sys = require('sys');
var wlog = require('./routes/wlog'); // pour mail et sms
var cronJob = require('cron').CronJob;
job_ping = new cronJob ({
	cronTime: '* * 2 * * *',   // ss mm hh jj MMM JJJ
	onTick: function(){
			
		  var madate = new Date();
		  console.log('==> Ping : '+Date());
		  var exec = require('child_process').exec;
		  var child;
		  var targets = ["192.168.0.61","192.168.0.66"];
		  var h = madate.getHours();

		  for (var i = 0; i < targets.length; i++) {
	  		 //exec ls
	  		 target = targets[i];

			  child = exec("ping -c1 "+targets[i],target, function (error, stdout, stderr){   // ps aux   - "vnstat -d"
				 // sys.print('stdout: '+target);
				  //sys.print('stderr: ' + stderr);
				  if (error !== null) {
					    console.log('!** '+h+' **!  error ping IP : '+ target); 
					   // wlog.send_mail('erreur Ping '+ targets[i]); // OK mais prefere sms
					    wlog.send_htc_sms('njs_erreur%2OPing%20'+target,function(err){});
					}else{
							console.log(h+' --> Ping '+ target);
						//wlog.send_htc_sms('test%2OPing%20'+target,function(err){});
					}
			  });
		  };

	},
	start : false
});
job_ping.start();
*/

var io = require ('socket.io').listen(httpServeur);

io.sockets.on('connection', function(socket){
	
		console.log('io : Nouveau user');

		var date = new Date();
		var h = date.getHours();
		if (h<10) { h = "0"+h}
			var mn = date.getMinutes();
		if (mn<10) { mn = "0"+mn}
 		 	var jj = date.getDay();
		if (jj<10) { jj = "0"+jj}
  			var mm = date.getMonth();
		if (mm<10) { mm = "0"+mm}

		var info =  { heure : h, min : mn };
		socket.emit('logged'); //envoi un info au user qui vient de se connecter
        io.sockets.emit('newuser',info);
		

});
