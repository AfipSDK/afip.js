const AfipWebService = require('./AfipWebService');

/**
 * SDK for AFIP Register Scope Ten (ws_sr_padron_a10)
 * 
 * @link http://www.afip.gob.ar/ws/ws_sr_padron_a10/manual_ws_sr_padron_a10_v1.1. WS Specification
 **/
module.exports = class RegisterScopeTen extends AfipWebService {
	constructor(afip){
		const options = {
			soapV12: false,
			WSDL: 'ws_sr_padron_a10-production.wsdl',
			URL: 'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA10',
			WSDL_TEST: 'ws_sr_padron_a10.wsdl',
			URL_TEST: 'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA10',
			afip
		}

		super(options, { service: 'ws_sr_padron_a10' });
	}
	/**
	 * Asks to web service for servers status {@see WS 
	 * Specification item 3.1}
	 *
	 * @return object { appserver : Web Service status, 
	 * dbserver : Database status, authserver : Autentication 
	 * server status}
	 **/
	async getServerStatus() {
		return this.executeRequest('dummy');
	}

	/**
	 * Asks to web service for taxpayer details {@see WS 
	 * Specification item 3.2}
	 *
	 * @throws Exception if exists an error in response 
	 *
	 * @return object|null if taxpayer does not exists, return null,  
	 * if it exists, returns full response {@see 
	 * WS Specification item 3.2.2}
	 **/
	async getTaxpayerDetails(identifier) {
		// Get token and sign
		let { token, sign } = await this.afip.GetServiceTA('ws_sr_padron_a10');

		// Prepare SOAP params
		let params = {
			token, sign,
			cuitRepresentada: this.afip.CUIT,
			idPersona: identifier
		};
		
		return this.executeRequest('getPersona', params)
		.then(res => res.persona)
		.catch(err => { if (err.message.indexOf('No existe') !== -1) { return null } else { throw err }});
	}

	/**
	 * Send request to AFIP servers
	 * 
	 * @param operation SOAP operation to execute 
	 * @param params Parameters to send
	 *
	 * @return mixed Operation results 
	 **/
	async executeRequest(operation, params = {})
	{
		let results = await super.executeRequest(operation, params);

		return results[operation === 'getPersona' ? 'personaReturn' : 'return'];
	}
}

