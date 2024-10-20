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

		if (options['WSDL']) {
			this.WSDL = options['WSDL'];
		}

		if (options['URL']) {
			this.URL = options['URL'];
		}

		if (options['WSDL_TEST']) {
			this.WSDL_TEST = options['WSDL_TEST'];
		}

		if (options['URL_TEST']) {
			this.URL_TEST = options['URL_TEST'];
		}

		if (options['generic'] === true) {
			if (typeof options['service'] === 'undefined') {
				throw new Error("service field is required in options");
			}

			if (typeof options['soapV1_2'] === 'undefined') {
				options['soapV1_2'] = true;
			}

			this.soapv12 = options['soapV1_2']
		}
	}

	/**
	 * Get Web Service Token Authorization from WSAA
	 * 
	 * @param {boolean} force Force to create a new token 
	 * authorization even if it is not expired
	 * 
	 * @throws Error if an error occurs
	 *
	 * @return TokenAuthorization Token Authorization for AFIP Web Service 
	 **/
	async getTokenAuthorization(force = false)
	{
		return this.afip.GetServiceTA(this.options['service'], force);
	}

	/**
	 * Send request to AFIP servers
	 * 
	 * @param {string} method SOAP operation to execute 
	 * @param {any} params Parameters to send
	 **/
	async executeRequest(method, params = {}) {
		// Prepare data to for request
		const data = {
			method,
			params,
			environment: this.afip.options['production'] === true ? "prod" : "dev",
			wsid: this.options['service'],
			url: this.afip.options['production'] === true ? this.URL : this.URL_TEST,
			wsdl: this.afip.options['production'] === true ? this.WSDL : this.WSDL_TEST,
			soap_v_1_2: this.soapv12
		};

		// Execute request
		const result = await this.afip.AdminClient.post('v1/afip/requests', data);

		//Return response
		return result.data;
	}
}
