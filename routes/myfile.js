/**
*  bibliotheque pour la lecture des fichers
*/

var fs = require ('fs');

/**
* Lis le fichier json !  liste des modules p/ piece
*/
exports.readContent = function (myFile,callback){
  
	console.log('-  Verification du fichier =>'+myFile);
  
	if (fs.existsSync(myFile)){
		    
		fs.readFile(myFile, 'utf8',function(err, content){
			if (err) {
				console.log('-  erreur lecture du fichier');
				 return callback(err);
			} else {
				console.log('-  lecture du fichier = ok');
				  callback(null,content);
			}
		})

	} else {console.log('*!!* Erreur de fichier => '+myFile); }
};


exports.delete = function(myfile,callback){

	if(fs.existsSync(myFile)){
		console.log ('- suppression fichier => '+myFile);

		fs.truncateSync(myFile,function(err){
			if(err) return callback(err);
				callback(null, true);
		});
	} else {console.log('*!!* Erreur de fichier => '+myFile); }


};