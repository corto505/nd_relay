
/***
*  Test exec script shell avec retour page html
*/
function execShell (myScript,callback){
  var sys = require('sys');
  var exec = require('child_process').exec;
  var child;

   console.log(' exec ==> '+myScript);
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

	var wlog = require('../routes/wlog');
  var message = req.params.message
  console.log(message);
  
    wlog.send_htc_sms(message,function(err){
    res.send({'resultat' : 'ok'});
    res.end('ok');//
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

  var code = 255 ^ idRelay; 

  execShell("i2cset -y 1 0x20 "+rang+" 0x"+code.toString(16), function (err,content){
        console.log('relai id='+idRelay+' On: '+content);
        setTimeout(function(){
          execShell("i2cset -y 1 0x20 "+rang+" 0xFF", function (err,content){
            console.log('relai id='+idRelay+' Off: '+content);
          });
        },delai);
  });

  res.send({'resultat' : 'ok'});
  res.end('ok');//

};