const fs = require('fs');
const path = require('path');
const soap = require('soap');
const forge = require('node-forge');
const xml2js = require('xml2js');
const Mixpanel = require('mixpanel');

// XML parser
var xmlParser = new xml2js.Parser({
	normalizeTags: true,
	normalize: true,
	explicitArray: false,
	attrkey: 'header',
	tagNameProcessors: [key => key.replace('soapenv:', '')]
});

// Generic Web Service
const AfipWebService = require('./Class/AfipWebService');


// Available Web Services
const ElectronicBilling = require('./Class/ElectronicBilling');
const RegisterScopeFour = require('./Class/RegisterScopeFour');
const RegisterScopeFive = require('./Class/RegisterScopeFive');
const RegisterScopeTen = require('./Class/RegisterScopeTen');
const RegisterScopeThirteen = require('./Class/RegisterScopeThirteen');

/**
 * Software Development Kit for AFIP web services
 * 
 * This release of Afip SDK is intended to facilitate 
 * the integration to other different web services that 
 * Electronic Billing   
 * 
 * @link http://www.afip.gob.ar/ws/ AFIP Web Services documentation
 * 
 * @author 	Afip SDK afipsdk@gmail.com
 * @package Afip
 * @version 0.6
 **/
module.exports = Afip;

function Afip(options = {}){
	/**
	 * File name for the WSDL corresponding to WSAA
	 *
	 * @var string
	 **/
	this.WSAA_WSDL;

	/**
	 * The url to get WSAA token
	 *
	 * @var string
	 **/
	this.WSAA_URL;

	/**
	 * File name for the X.509 certificate in PEM format
	 *
	 * @var string
	 **/
	this.CERT;

	/**
	 * File name for the private key correspoding to CERT (PEM)
	 *
	 * @var string
	 **/
	this.PRIVATEKEY;

	/**
	 * Afip resources folder
	 *
	 * @var string
	 **/
	this.RES_FOLDER;

	/**
	 * The CUIT to use
	 *
	 * @var int
	 **/
	this.CUIT;

	// Create an Afip instance if it is not
	if (!(this instanceof Afip)) {return new Afip(options)}

	// Create an instance of the mixpanel client
	this.mixpanel = Mixpanel.init('e87ee11c8cc288e5c5dc213c4d957c7e');
	this.mixpanelRegister = {};

	this.mixpanelRegister['afip_sdk_library'] = 'javascript';

	if (!options.hasOwnProperty('CUIT')) {throw new Error("CUIT field is required in options array");}
	

	// Define default options
	if (!options.hasOwnProperty('production')) {options['production'] = false;}
	if (!options.hasOwnProperty('cert')) {options['cert'] = 'cert';}
	if (!options.hasOwnProperty('key')) {options['key'] = 'key';}
	if (!options.hasOwnProperty('res_folder')) {options['res_folder'] = __dirname+'/Afip_res/';}
	if (!options.hasOwnProperty('ta_folder')) {options['ta_folder'] = __dirname+'/Afip_res/';}
	if (options['production'] !== true) {options['production'] = false;}

	this.mixpanelRegister['distinct_id'] = options['CUIT'];
	this.mixpanelRegister['production'] = options['production'];

	try {
		this.mixpanel.track('initialized', Object.assign({}, this.mixpanelRegister, options));
	} catch (e) {}

	this.options = options;

	this.CUIT 		= options['CUIT'];
	this.RES_FOLDER = options['res_folder'];
	this.TA_FOLDER 	= options['ta_folder'];
	this.CERT 		= path.resolve(this.RES_FOLDER, options['cert']);
	this.PRIVATEKEY = path.resolve(this.RES_FOLDER, options['key']);
	this.WSAA_WSDL 	= path.resolve(__dirname, 'Afip_res/', 'wsaa.wsdl');

	if (options['production']) {
		this.WSAA_URL = 'https://wsaa.afip.gov.ar/ws/services/LoginCms';
	}
	else {
		this.WSAA_URL = 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms';
	}

	this.ElectronicBilling 			= new ElectronicBilling(this);
	this.RegisterScopeFour 			= new RegisterScopeFour(this);
	this.RegisterScopeFive 			= new RegisterScopeFive(this);
	this.RegisterInscriptionProof 	= new RegisterScopeFive(this);
	this.RegisterScopeTen 			= new RegisterScopeTen(this);
	this.RegisterScopeThirteen 		= new RegisterScopeThirteen(this);
}

/**
 * Gets token authorization for an AFIP Web Service
 *
 * @param service Service for token authorization
 **/
Afip.prototype.GetServiceTA = async function(service, firstTry = true) {
	// Declare token authorization file path
	const taFilePath = path.resolve(
		this.TA_FOLDER,
		`TA-${this.options['CUIT']}-${service}${this.options['production'] ? '-production' : ''}.json`
	);

	// Check if token authorization file exists
	const taFileAccessError = await new Promise((resolve) => {
		fs.access(taFilePath, fs.constants.F_OK, resolve);
	}); 

	// If have access to token authorization file
	if (!taFileAccessError) {
		const taData = require(taFilePath);
		const actualTime = new Date(Date.now() + 600000);
		const expirationTime = new Date(taData.header[1].expirationtime);

		// Delete TA cache
		delete require.cache[require.resolve(taFilePath)];

		if (actualTime < expirationTime) {
			// Return token authorization
			return {
				token : taData.credentials.token,
				sign : taData.credentials.sign
			}
		}
	}
	
	// Throw error if this is not the first try to get token authorization
	if (firstTry === false){
		throw new Error('Error getting Token Autorization');
	}

	// Create token authorization file
	await this.CreateServiceTA(service).catch(err => {
		throw new Error(`Error getting Token Autorization ${err}`)
	});

	// Try to get token authorization one more time
	return await this.GetServiceTA(service, false);
}

/**
 * Create an TA from WSAA
 *
 * Request to WSAA for a tokent authorization for service 
 * and save this in a json file
 *
 * @param service Service for token authorization
 **/
Afip.prototype.CreateServiceTA = async function(service) {
	const date = new Date();
	
	// Tokent request authorization XML
	const tra = (`<?xml version="1.0" encoding="UTF-8" ?>
	<loginTicketRequest version="1.0">
		<header>
			<uniqueId>${Math.floor(date.getTime() / 1000)}</uniqueId>
			<generationTime>${new Date(date.getTime() - 600000).toISOString()}</generationTime>
			<expirationTime>${new Date(date.getTime() + 600000).toISOString()}</expirationTime>
		</header>
		<service>${service}</service>
	</loginTicketRequest>`).trim();

	// Get cert file content
	const certPromise = new Promise((resolve, reject) => {
		fs.readFile(this.CERT, { encoding:'utf8' }, (err, data) => err ? reject(err) : resolve(data));
	});
		
	// Get key file content
	const keyPromise = new Promise((resolve, reject) => {
		fs.readFile(this.PRIVATEKEY, { encoding:'utf8' }, (err, data) => err ? reject(err) : resolve(data));
	});

	// Wait for cert and key content
	const [cert, key] = await Promise.all([certPromise, keyPromise]);

	// Sign Tokent request authorization XML
	const p7 = forge.pkcs7.createSignedData();
	p7.content = forge.util.createBuffer(tra, "utf8");
	p7.addCertificate(cert);
	p7.addSigner({
		authenticatedAttributes: [{
			type: forge.pki.oids.contentType,
			value: forge.pki.oids.data,
		}, 
		{
			type: forge.pki.oids.messageDigest
		}, 
		{
			type: forge.pki.oids.signingTime, 
			value: new Date()
		}],
		certificate: cert,
		digestAlgorithm: forge.pki.oids.sha256,
		key: key,
	});
	p7.sign();
	const bytes = forge.asn1.toDer(p7.toAsn1()).getBytes();
	const signedTRA = Buffer.from(bytes, "binary").toString("base64");

	// SOAP Client options
	const soapClientOptions = { disableCache:true, endpoint: this.WSAA_URL };

	// Create SOAP client
	const soapClient = await soap.createClientAsync(this.WSAA_WSDL, soapClientOptions);

	// Arguments for soap client request 
	const loginArguments = { in0: signedTRA };
	
	// Call loginCms SOAP method
	const [ loginCmsResult ] = await soapClient.loginCmsAsync(loginArguments)

	// Parse loginCmsReturn to JSON 
	const res = await xmlParser.parseStringPromise(loginCmsResult.loginCmsReturn); 

	// Declare token authorization file path
	const taFilePath = path.resolve(
		this.TA_FOLDER,
		`TA-${this.options['CUIT']}-${service}${this.options['production'] ? '-production' : ''}.json`
	);
	
	// Save Token authorization data to json file
	await (new Promise((resolve, reject) => {
		fs.writeFile(taFilePath, JSON.stringify(res.loginticketresponse), (err) => {
			if (err) {reject(err);return;}
			resolve();
		});
	}));
}


/**
 * Track SDK usage
 * 
 * @param string web_service ID of the web service used
 * @param string operation SOAP operation called 
 * @param array params Parameters for the ws
 **/
Afip.prototype.TrackUsage = function(web_service, operation, params = {}) {
	options = {};

	if (web_service === 'wsfe' && operation === 'FECAESolicitar') {
		if (params['FeCAEReq'] && params['FeCAEReq']['FeCabReq'] && params['FeCAEReq']['FeCabReq']['CbteTipo']) {
			options['CbteTipo'] = params['FeCAEReq']['FeCabReq']['CbteTipo'];
		}

		if (params['FeCAEReq'] && params['FeCAEReq']['FeDetReq'] && params['FeCAEReq']['FeDetReq']['FECAEDetRequest'] && params['FeCAEReq']['FeDetReq']['FECAEDetRequest']['ImpTotal']) {
			options['ImpTotal'] = params['FeCAEReq']['FeDetReq']['FECAEDetRequest']['ImpTotal'];
		}
	}

	try {
		this.mixpanel.track(web_service+'.'+operation, Object.assign({}, this.mixpanelRegister, options));
	} catch (e) {}
}

/**
 * Create generic Web Service
 * 
 * @param string service Web Service name
 * @param array options Web Service options
 *
 * @return AfipWebService Token Authorization for AFIP Web Service 
 **/
Afip.prototype.WebService = function (service, options)
{
	options['service'] = service;
	options['generic'] = true;

	return new AfipWebService({ afip: this }, options);
}