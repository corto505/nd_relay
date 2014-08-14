
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
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


app.get('/', routes.index);
app.get('/relai/:id/:delai', routes.cde_relai);
app.get('/sms/:message', routes.send_sms);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//::::::::::::::::   Autres Fonctions  ::::::::::::::::::

var sys = require('sys');
var wlog = require('./routes/wlog'); // pour mail et sms

/*
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

var cronJob = require('cron').CronJob;
job_ping = new cronJob ({
	cronTime: '30 * * * * *',   // ss mm hh jj MMM JJJ
	onTick: function(){
			

		  console.log('==> Ping : '+Date());
		  var exec = require('child_process').exec;
		  var child;
		  var targets = ["192.168.0.61","192.168.0.66"];

		  for (var i = 0; i < targets.length; i++) {
	  		 //exec ls
	  		 target = targets[i];

			  child = exec("ping -c1 "+targets[i],target, function (error, stdout, stderr){   // ps aux   - "vnstat -d"
				 // sys.print('stdout: '+target);
				  //sys.print('stderr: ' + stderr);
				  if (error !== null) {
					    console.log('!****!  error ping IP : '+ target); 
					   // wlog.send_mail('erreur Ping '+ targets[i]); // OK mais prefere sms
					    wlog.send_htc_sms('erreur%2OPing%20'+target,function(err){});
					}else{
							console.log('  --> Ping '+ target);
						//wlog.send_htc_sms('test%2OPing%20'+target,function(err){});
					}
			  });
		  };

	},
	start : false
});
job_ping.start();

