
/***
*  Test exec script shell avec retour page html
*/
function execShell (myScript,callback){
  var sys = require('sys');
  var exec = require('child_process').exec;
  var child;

   console.log(' -------- '+myScript);
  //exec ls
  child = exec(myScript, function (error, stdout, stderr){   // ps aux   - "vnstat -d"
  //sys.print('stdout: '+stdout);
  //sys.print('stderr: ' + stderr);
  if (error !== null) {
    console.log('!****!  exec error: '+ error); 
    return callback(stderr);
  }
  callback(null,stdout);
  });
};



/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};


/*****************************************
*  Passerelle envoi de sms
*
*****************************************/
exports.send_sms = function(req,res){

	http = require('http');
	var tel = '0689816473';  //req.param.tel
	var message = req.params.message;

	var options = {
	  host: '192.168.0.61',
	  port: 9090,
	  path: '/sendsms?phone='+tel+'&text='+message+'&password=tedjyx33'
	};

	http.get(options, function(reponse) {
	  
        if (reponse.statusCode ==200){
          console.log("Send Sms:  " + Date('d/M/Y h:m'));
         res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('Message envoyé');
        }
  		}).on('error', function(e) {
	       console.log("Got error: " + e.message);
        res.writeHead(200, {'Content-Type': 'text/plain'});
         res.end('Erreur sms : '.e.message);
	});

};


/**
*  Activation des relais
*
*/
exports.cde_relai = function (req,res){
  var idRelay = req.params.id;
  var delai = req.params.delai;

  if (delai == 0 ){
    delai = 200;
  }
  var rang = '0X14'; // rangee de relais

  if(idRelay >=9){
      rang = '0X15';
      idRelay = idRelay - 8;
  }
  if (idRelay > 1){
       idRelay = 1 << (idRelay-1);
  }

  console.log('id => '+idRelay);
  var code = 255 ^ idRelay; 

  execShell("i2cset -y 1 0x20 "+rang+" 0x"+code.toString(16), function (err,content){
        console.log(content);
  });

   
  setTimeout(function(){
      execShell("i2cset -y 1 0x20 "+rang+" 0xFF", function (err,content){
        console.log(content);
      });
  },delai);

  res.send({'resultat' : 'ok'});
  res.end('ok');//

};