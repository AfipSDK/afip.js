const soap = require('soap');
const path = require('path');

/**
 * Base class for AFIP web services 
 **/ 
module.exports = class AfipWebService {
	constructor(webServiceOptions){
		if (!webServiceOptions) {
			throw new Error('Missing Web Service Object');
		}
		
		/**
		 * Force to use SOAP Client version 1.2
		 *
		 * @var boolean
		 **/
		this.soapv12 = webServiceOptions.soapV12 || false;

		/**
		 * File name for the Web Services Description Language
		 *
		 * @var string
		 **/
		this.WSDL = webServiceOptions.WSDL;
		
		/**
		 * The url to web service
		 *
		 * @var string
		 **/
		this.URL = webServiceOptions.URL;

		/**
		 * File name for the Web Services Description 
		 * Language in test mode
		 *
		 * @var string
		 **/
		this.WSDL_TEST = webServiceOptions.WSDL_TEST;

		/**
		 * The url to web service in test mode
		 *
		 * @var string
		 **/
		this.URL_TEST = webServiceOptions.URL_TEST;
		
		/**
		 * The Afip parent Class
		 *
		 * @var Afip
		 **/
		this.afip = webServiceOptions.afip;
		
		if (this.afip.options['production']) {
			this.WSDL = path.resolve(__dirname, '../Afip_res', this.WSDL);
		}
		else{
			this.WSDL = path.resolve(__dirname, '../Afip_res', this.WSDL_TEST);
			this.URL = this.URL_TEST;
		}
	}

	/**
	 * Send request to AFIP servers
	 * 
	 * @param operation SOAP operation to execute 
	 * @param params Parameters to send
	 **/
	async executeRequest(operation, params = {}) {
		// Create SOAP client
		if (!this.soapClient) {
			let soapClientOptions = { 
				disableCache: true, 
				forceSoap12Headers: this.soapv12
			};

			this.soapClient = await soap.createClientAsync(this.WSDL, soapClientOptions);
			/* Sobre escribir la URL del archivo .wsdl */
			this.soapClient.setEndpoint(this.URL);
		}

		// Call to SOAP method
		let [ result ] = await this.soapClient[operation+'Async'](params);
		
		//Return response parsed as JSON
		return result;
	}
}
