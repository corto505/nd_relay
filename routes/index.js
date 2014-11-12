
var toolfile = require ('../routes/toolfile'); // module perso lecture d'un fichier

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

/**
*  Permet de tester le service
*/
exports.test_ping = function (req,res){
/*  for(var i=1 ; i<=8 ; i++){
    console.log(255-Math.pow(2,i-1));
  }*/
  res.send({'resultat -xx ' : 'ok'});
    res.end('ok');//
}

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
 *  gestion de led viad http
 * 29/9/14 : Modification proc, pi-gpio ne fonctionne plus
 * on passe maintenant direct par cde shell
 ***/
exports.led = function (req,res){
  var gpio = require ("pi-gpio");
  var pins = parseInt(req.params.pins);
  var etat = parseInt(req.params.etat);


  if (pins >=0 && pins <=24){
    
        execShell("gpio mode "+pins+ " out", function (err,content){
        });
          execShell("gpio write "+pins+" "+etat, function (err,content){
        });

      res.send('requete envoyée');
  }else{
      res.send('!**!  erreur : Num GPIO : '+pins);
  }
};

exports.init_relai = function (req,res){
  console.log('Initialisation des relais');
  execShell("i2cset -y 1 0x20 0X00 0x00", function (err,content){});
  execShell("i2cset -y 1 0x20 0x01 0x00", function (err,content){});
  res.header('Access-Control-Allow-Origin', "*") //permet le requete venant d'un autre domaine
  res.writeHead(200,{"content-Type" : "text/plain"});
    res.write("OK : requête envoyée");
    res.end();
};


/**
*  Activation des relais
*
*/
exports.cde_relai = function (req,res){
  var idRelay = req.params.id;
  var ordre = req.params.ordre;
  var delai = req.params.delai;

   var rang = '0X14'; // rangee de relais
   console.log('***** idrelay '+idRelay);

  if(idRelay >=9){
      rang = '0X15';
      idRelay = idRelay - 8;
  }
  /*if (idRelay > 1){
       idRelay = 1 << (idRelay-1);
  }
*/
  var code = 255-Math.pow(2,idRelay-1)//255 ^ idRelay; 
  console.log("Irelay " + idRelay);
  console.log("rang " + rang);
  console.log("code " + code);

  if (delai == 0 ){ // odre classique On/Off
    

    if (ordre =='Off'){
            console.log('relai id='+idRelay+' Off: code : '+code);
            execShell("i2cset -y 1 0x20 "+rang+" 0xFF", function (err,content){
        });

    }else{

        console.log('relai id='+idRelay+' On: code : '+code);
        execShell("i2cset -y 1 0x20 "+rang+" 0x"+code.toString(16), function (err,content){
      });
    }
    

  }else {

      console.log('1-------- relai id='+idRelay+' On: code '+code);
      execShell("i2cset -y 1 0x20 "+rang+" 0x"+code.toString(16), function (err,content){  
        
  });

    setTimeout(function(){
            console.log('2-------- relai id='+idRelay+' Off: code '+code);
            execShell("i2cset -y 1 0x20 "+rang+" 0xFF", function (err,content){
          });
        },delai);

  }

  //res.send({'resultat' : 'ok'});
  res.end('ok');//

};

//===========  GESTION COD ACCES  ========

//************************
// code_create : creation d'un code de controle
//************************
exports.code_create = function(req,res){

    random = require("random");
    var cde = req.params.cde;

    function randomCallback(integers){

        // creation du code
        var nbre = integers[0][0];
        console.log(nbre);

        var start = new Date().getTime(); // creation du temps de depart

       //  var elapsed = new Date().getTime() - start;
       
       //creation de l'uid
       var uid = require("gen-uid");
       var cliUid = uid.token();

       var myObject = {
          'resultat' : nbre,
           'temps': start,
           'uid': cliUid,
           'code': nbre,
           'cde': cde
         };
        console.log(myObject);

       // ecrire le fichier json
       var fs = require('fs');
       fs.writeFileSync("./public/json/"+cliUid+"_"+cde+".json", JSON.stringify(myObject),"UTF-8");

        res.send(myObject);
        res.end('ok');//

    }


    var options = {
        secure: true,
        num: 1,
        min: 1000,
        max: 9999
    };
    function errorCallback(type,code,string){
        console.log("RANDOM.ORG Error: Type: "+type+", Status Code: "+code+", Response Data: "+string);
    }

     random.generateIntegers(randomCallback,options,errorCallback);
     
    
}

/**
 * [code_verif verification du code genéré]
 * @param  {[varchar]} req.uid [token]
 * @param  {[varchar]} req.cde [cde domotic]
 * @param  {[integer]} res.code [code saisie par le user]
 * @return {[bool]}     [si verif ok]
 */
exports.code_verif = function(req,res){

  var myfile = require("./myfile")
  var uidCLi = req.params.uid;
  var cdeCli = req.params.cde;
  var codeCli = req.params.code;

  var $file = uidCLi+"_"+cdeCli+".json"
  var start = new Date().getTime(); // creation du temps de depart
  var tpsMax = 60*60*1000*5 ; // = 5mn

  //lecture du ficier pour recup des infos
 myfile.readContent("./public/json/"+$file,function(err,contentJson){
      console.log('fin lecture'); 
      var objVal = JSON.parse(contentJson);

      if ( (start - objVal.temps) <= tpsMax){
          console.log('le temps es ok'); 
          if(codeCli == objVal.code){
               res.send ('Test ok '+objVal.uid);
          
          }else{
              console.log('Erreur sur le code'); 

          }

      }else{
          console.log('Erreur sur le temps:'+  objVal.temps); 

      }

      res.end();//

  });
            

}


//=============   TEST  =======================

/**************************
* Affiche les boutons du tableau de bord
* à partir d'un fichier /public/json => Traite par ANGULAR
*  routes  = /tdb
***************************/
exports.lireBtnTdb = function(req,res){
  var config = require('./config.js').settings;
  var myFile = config.files.fileTdb;
  
  toolfile.readContent(myFile, function(err,content){
  
    lesBtn = JSON.parse(content);
    console.log(' Boutton => '+lesBtn);
    
    res.json(lesBtn);   
  });
  
}


exports.Node_MCP23017_test = function (req,res){
    var MCP23017 = require('node-mcp23017');

    var mcp = new MCP23017({
      address: 0x20, //all address pins pulled low
      device: '/dev/i2c-1', // Model B
      debug: true
    });

    /*
      This function blinks 16 LED, each hooked up to an port of the MCP23017
    */
    var pin = 0;
    var max = 16;
    var state = false;

    var blink = function() {
        if (pin >= max) {
          pin = 0; //reset the pin counter if we reach the end
        }

        if (state) {
          mcp.digitalWrite(pin, mcp.LOW); //turn off the current LED
          pin++; //increase counter
        } else {
          mcp.digitalWrite(pin, mcp.HIGH); //turn on the current LED
          console.log('blinking pin', pin);
        }
        state = !state; //invert the state of this LED
    };

    //define all gpios as outputs
    for (var i = 0; i < 16; i++) {
       mcp.pinMode(i, mcp.OUTPUT);
    }

    setInterval(blink, 100); //blink all LED's with a delay of 100ms
}

/**
*  ??? mat ttoute la barette A a ON ??, non voulue
*/
exports.mcp23017_test = function (req,res){
  var MCP23017 = require('mcp23017');

  var address = 0x20;
  var mcp = new MCP23017(address, '/dev/i2c-1');
  mcp.allOff();

   mcp.setGpioAPinValue(0,0); //set GPIO A Pin 0 to high
  mcp.setGpioAPinValue(5,1); //set GPIO A Pin 0 to low
  //console.log(mcp.getGpioBPinValue(0)); //get GPIO B Pin 0 value

}
