/**
*  bibliotheque pour la lecture des fichers
*
*
*/

/**
* Lis le fichier json !  liste des modules p/ piece
*/
exports.readContent = function (myFile,callback){
	var fs = require ('fs');
  
	console.log('-  Verification du fichier =>'+myFile);
  
	if (fs.existsSync(myFile)){
		console.log('-  lecture du fichier');
    
		fs.readFile(myFile, 'utf8',function(err, content){
			if (err) return callback(err)
			callback(null, content)
		})
	} else {console.log('*!!* Erreur de fichier'); }
};

