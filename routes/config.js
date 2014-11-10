exports.settings = 
{
	files: 
	{	
		filePieces     : './public/json/pieces.json', // A supprimer ??
		logFile	       : '/public/logApp.log',
		sceneFolder    : './public/scenari/', // a suprimer
		fileDevices    : './public/json/devices.json', //fichier DOMOTICZ
		fileDevicesNode : './public/json/devices_node.json',  // fichier DOMOTICZ converti
		fileTdb        : './public/json/boutonTdb.json' // liste des boutons du tableau de bord
	}
		,
	domoticz : {
	
		host : "192.168.0.66",
		port : 8080,
		Method : 'GET'
	},
	lettreHouse : 'M'
	
}