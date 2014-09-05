
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
  res.send({'resultat' : 'ok'});
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
 *
 ***/
exports.led = function (req,res){
  var gpio = require ("pi-gpio");
  var pins = parseInt(req.params.pins);
  var etat = parseInt(req.params.etat);
   
  if (pins >=0 && pins <=7){
      gpio.open(pins,"output", function(err){
        gpio.write(pins,etat,function(){
          console.log('commande envoyée :'+etat);
          gpio.close(pins);
        });
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
  if (idRelay > 1){
       idRelay = 1 << (idRelay-1);
  }

  var code = 255 ^ idRelay; 

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

  res.send({'resultat' : 'ok'});
  res.end('ok');//

};


//=============   TEST  =======================
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
