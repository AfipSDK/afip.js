/**
 * Base class for AFIP web services 
 *
 * @since 0.5
 *
 * @package Afip
 * @author 	Ivan Muñoz
 **/ 

const soap = require('soap'),
	  parseString = require('xml2js').parseString;

module.exports = AfipWebService;

function AfipWebService(ws){
	if (!ws) {throw new Error('Missing Web Service Object');}
	/**
	 * Force to use SOAP Client version 1.2
	 *
	 * @var boolean
	 **/
	this.force_soap_v1_2 = ws.force_soap_v1_2;

	/**
	 * File name for the Web Services Description Language
	 *
	 * @var string
	 **/
	this.WSDL = ws.WSDL;
	
	/**
	 * The url to web service
	 *
	 * @var string
	 **/
	this.URL = ws.URL;

	/**
	 * File name for the Web Services Description 
	 * Language in test mode
	 *
	 * @var string
	 **/
	this.WSDL_TEST = ws.WSDL_TEST;

	
	/**
	 * The url to web service in test mode
	 *
	 * @var string
	 **/
	this.URL_TEST = ws.URL_TEST;
	
	/**
	 * The Afip parent Class
	 *
	 * @var Afip
	 **/
	this.afip = ws.afip;
	

	if (this.afip.options['production'] === true) {
		this.WSDL = this.afip.RES_FOLDER+this.WSDL;
	}
	else{
		this.WSDL 	= this.afip.RES_FOLDER+this.WSDL_TEST;
		this.URL 	= this.URL_TEST;
	}

	fs.access(this.WSDL, fs.constants.F_OK, (err) => {
		if (err) {throw new Error("Failed to open file "+this.WSDL);}
	});
}

/**
 * Sends request to AFIP servers
 * 
 * @since 1.0
 *
 * @param string 	operation 	SOAP operation to do 
 * @param array 	params 	Parameters to send
 *
 * @return promise 
 **/
AfipWebService.prototype.ExecuteRequest = function(operation, params) {

	return new Promise((resolve,reject)=>{
	
		if (this.soap_client) {
			executute_operation();
		}
		else{
			var options = { disableCache:true, returnFault:true };
			soap.createClient(this.WSDL, options,(err, client)=> {
				if (err) {reject(err);return;}
				this.soap_client = client;
				executute_operation();
			});
		}

		function executute_operation() {
			this.soap_client[operation](params, (err, res)=>{
				if (err){reject(err.message);}
				else{
					parseString(result.loginCmsReturn, {
						normalizeTags: true,
						normalize: true,
						explicitArray: false,
						tagNameProcessors: [(key) => { return key.replace('soapenv:', ''); }]
					}, (err, res) => {
						if (err) {reject(err);return;}
						resolve(res)
					});
				}
			})
		}

	});
}