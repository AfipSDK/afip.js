const soap = require('soap');
const path = require('path');

/**
 * Base class for AFIP web services 
 **/ 
module.exports = class AfipWebService {
	constructor(webServiceOptions, options = {}){
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
		
		/**
		 * Options
		 * 
		 * @var object
		 **/
		this.options = options;

		if (options['generic'] === true) {
			if (typeof options['WSDL'] === 'undefined') {
				throw new Error("WSDL field is required in options");
			}

			if (typeof options['URL'] === 'undefined') {
				throw new Error("URL field is required in options");
			}

			if (typeof options['WSDL_TEST'] === 'undefined') {
				throw new Error("WSDL_TEST field is required in options");
			}

			if (typeof options['URL_TEST'] === 'undefined') {
				throw new Error("URL_TEST field is required in options");
			}

			if (typeof options['service'] === 'undefined') {
				throw new Error("service field is required in options");
			}

			if (this.afip.options['production'] === true) {
				this.WSDL = options['WSDL'];
				this.URL 	= options['URL'];
			} else {
				this.WSDL = options['WSDL_TEST'];
				this.URL 	= options['URL_TEST'];
			}

			if (typeof options['soapV1_2'] === 'undefined') {
				options['soapV1_2'] = true;
			}

			this.soapv12 = options['soapV1_2']
		}
		else {
			if (this.afip.options['production']) {
				this.WSDL = path.resolve(__dirname, '../Afip_res', this.WSDL);
			}
			else{
				this.WSDL = path.resolve(__dirname, '../Afip_res', this.WSDL_TEST);
				this.URL = this.URL_TEST;
			}
		}
	}

	/**
	 * Get Web Service Token Authorization from WSAA
	 * 
	 * @since 0.6
	 *
	 * @throws Error if an error occurs
	 *
	 * @return TokenAuthorization Token Authorization for AFIP Web Service 
	 **/
	async getTokenAuthorization()
	{
		return this.afip.GetServiceTA(this.options['service']);
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
		
		this.afip.TrackUsage(this.options['service'], operation, params);

		//Return response parsed as JSON
		return result;
	}
}
