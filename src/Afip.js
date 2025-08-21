const axios = require('axios');

// Generic Web Service
const AfipWebService = require('./Class/AfipWebService');

// Available Web Services
const ElectronicBilling = require('./Class/ElectronicBilling');
const RegisterScopeFour = require('./Class/RegisterScopeFour');
const RegisterScopeFive = require('./Class/RegisterScopeFive');
const RegisterInscriptionProof = require('./Class/RegisterInscriptionProof');
const RegisterScopeTen = require('./Class/RegisterScopeTen');
const RegisterScopeThirteen = require('./Class/RegisterScopeThirteen');

/**
 * Software Development Kit for ARCA web services
 * 
 * @link https://afipsdk.com/
 * 
 * @author Afip SDK <ayuda@afipsdk.com>
 * @package Afip
 **/
module.exports = Afip;

function Afip(options = {}){
	/**
	 * SDK version
	 **/
	this.sdk_version_number = '1.2.0';

	/**
	 * X.509 certificate in PEM format
	 *
	 * @var string
	 **/
	this.CERT;

	/**
	 * Private key correspoding to CERT (PEM)
	 *
	 * @var string
	 **/
	this.PRIVATEKEY;

	/**
	 * Tax id to use
	 *
	 * @var int
	 **/
	this.CUIT;

	// Create an Afip instance if it is not
	if (!(this instanceof Afip)) {return new Afip(options)}

	// Define default options
	if (!options.hasOwnProperty('CUIT')) {options['CUIT'] = undefined;}
	if (!options.hasOwnProperty('production')) {options['production'] = false;}
	if (!options.hasOwnProperty('cert')) {options['cert'] = undefined;}
	if (!options.hasOwnProperty('key')) {options['key'] = undefined;}
	if (options['production'] !== true) {options['production'] = false;}

	this.options = options;

	this.CUIT 		= options['CUIT'];
	this.CERT 		= options['cert'];
	this.PRIVATEKEY = options['key'];

	// Create an axios instance for the api
	/** @private */
	this.AdminClient = axios.create({
		baseURL: 'https://app.afipsdk.com/api/',
		timeout: 30000
	});

	// Config default response to avoid send all data in errors
	this.AdminClient.interceptors.response.use(function (response) {
		const newResponse = {
			status: response.status,
			statusText: response.statusText,
			data: response.data
		};

		return newResponse;
	}, function (error) {
		const newError = new Error(error.message);

		newError.status = error.response.status;
		newError.statusText = error.response.statusText;
		newError.data = error.response.data;

		return Promise.reject(newError);
	});

	this.AdminClient.defaults.headers.common['sdk-version-number'] = this.sdk_version_number;
	this.AdminClient.defaults.headers.common['sdk-library'] = 'javascript';
	this.AdminClient.defaults.headers.common['sdk-environment'] = this.options['production'] === true ? "prod" : "dev";

	if (this.options['access_token']) {
		this.AdminClient.defaults.headers.common['Authorization'] = `Bearer ${this.options['access_token']}`;
	}

	this.ElectronicBilling 			= new ElectronicBilling(this);
	this.RegisterScopeFour 			= new RegisterScopeFour(this);
	this.RegisterScopeFive 			= new RegisterScopeFive(this);
	this.RegisterInscriptionProof 	= new RegisterInscriptionProof(this);
	this.RegisterScopeTen 			= new RegisterScopeTen(this);
	this.RegisterScopeThirteen 		= new RegisterScopeThirteen(this);
}

/**
 * Gets token authorization for an AFIP Web Service
 *
 * @param {string} service Service for token authorization
 * @param {boolean} force Force to create a new token 
 * authorization even if it is not expired
 * 
 * @private
 **/
Afip.prototype.GetServiceTA = async function(service, force = false) {
	// Prepare data to for request
	const data = {
		environment: this.options['production'] === true ? "prod" : "dev",
		wsid: service,
		tax_id: this.options['CUIT'],
		force_create: force
	};

	// Add cert if is set
	if (this.CERT) {
		data.cert = this.CERT;
	}

	// Add key is is set
	if (this.PRIVATEKEY) {
		data.key = this.PRIVATEKEY;
	}
	
	// Execute request
	const result = await this.AdminClient.post('v1/afip/auth', data);

	//Return response
	return result.data;
}

/**
 * Get last request and last response XML
 **/
Afip.prototype.getLastRequestXML = async function() {
	// Execute request
	const { data } = await this.AdminClient.get('v1/afip/requests/last-xml');

	//Return response
	return data;
}

/**
 * Create generic Web Service
 * 
 * @param {string} service Web Service name
 * @param {any} options Web Service options
 *
 * @return AfipWebService New AFIP Web Service 
 **/
Afip.prototype.WebService = function (service, options = {}) {
	options['service'] = service;
	options['generic'] = true;

	return new AfipWebService({ afip: this }, options);
}

/**
 * Create AFIP cert.
 *
 * **This method is deprecated and will be removed in future major versions.**
 * @deprecated Use CreateAutomation instead
 *
 * @param {string} username Username used in AFIP page
 * @param {string} password Password used in AFIP page
 * @param {string} alias Alias for the cert
 **/
Afip.prototype.CreateCert = async function(username, password, alias) {
	// Prepare data to for request
	const data = {
		environment: this.options['production'] === true ? "prod" : "dev",
		tax_id: this.options['CUIT'],
		username, 
		password, 
		alias
	};

	// Wait for max 120 seconds
	let retry = 24;

	while (retry-- >= 0) {
		
		// Execute request
		const result = await this.AdminClient.post('v1/afip/certs', data);
		
		if (result.data.status === 'complete') {
			return result.data.data;
		}
		
		if (result.data.long_job_id) {
			data.long_job_id = result.data.long_job_id;
		}
		// Wait 5 seconds
		await (new Promise(resolve => setTimeout(resolve, 5000)));
	}

	throw new Error('Error: Waiting for too long');
}

/**
 * Create authorization to use a web service
 *
 * **This method is deprecated and will be removed in future major versions.**
 * @deprecated Use CreateAutomation instead
 *
 * @param {string} username Username used in AFIP page
 * @param {string} password Password used in AFIP page
 * @param {string} alias Cert alias
 * @param {string} wsid Web service id
 **/
Afip.prototype.CreateWSAuth = async function(username, password, alias, wsid) {
	// Prepare data to for request
	const data = {
		environment: this.options['production'] === true ? "prod" : "dev",
		tax_id: this.options['CUIT'],
		username, 
		password,
		wsid,
		alias
	};

	// Wait for max 120 seconds
	let retry = 24;

	while (retry-- >= 0) {
		// Execute request
		const result = await this.AdminClient.post('v1/afip/ws-auths', data);
		
		if (result.data.status === 'complete') {
			return result.data.data;
		}

		if (result.data.long_job_id) {
			data.long_job_id = result.data.long_job_id;
		}

		// Wait 5 seconds
		await (new Promise(resolve => setTimeout(resolve, 5000)));
	}

	throw new Error('Error: Waiting for too long');
}

/**
 * Create automation
 *
 * @param {string} automation Name of the automation
 * @param {array} params Parameters to send to the automation
 * @param {boolean} wait Wait for the automation to finish (default true)
 **/
Afip.prototype.CreateAutomation = async function(automation, params, wait = true) {
	// Prepare data to for request
	const data = { automation, params };

	// Execute request
	const result = await this.AdminClient.post('v1/automations', data);
	
	if (!wait || result.data.status === 'complete') {
		return result.data;
	}

	return this.GetAutomationDetails(result.data.id, wait);
}

/**
 * Create automation
 *
 * @param {string} $id Id of the automation
 * @param {boolean} $wait Wait for the automation to finish (default false)
 **/
Afip.prototype.GetAutomationDetails = async function(id, wait = false) {
	// Wait for max 120 seconds
	let retry = 24;

	while (retry-- >= 0) {
		// Execute request
		const result = await this.AdminClient.get(`v1/automations/${id}`);

		if (!wait || result.data.status === 'complete') {
			return result.data;
		}

		// Wait 5 seconds
		await (new Promise(resolve => setTimeout(resolve, 5000)));
	}

	throw new Error('Error: Waiting for too long');
}