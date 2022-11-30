const AfipWebService = require('./AfipWebService');

/**
 * SDK for AFIP Register Scope Thirteen (ws_sr_padron_a13)
 * 
 * @link http://www.afip.gob.ar/ws/ws-padron-a13/manual-ws-sr-padron-a13-v1.2.pdf WS Specification
 **/
module.exports = class RegisterScopeThirteen extends AfipWebService {
	constructor(afip){
		const options = {
			soapV12: false,
			WSDL: 'ws_sr_padron_a13-production.wsdl',
			URL: 'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA13',
			WSDL_TEST: 'ws_sr_padron_a13.wsdl',
			URL_TEST: 'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA13',
			afip
		}

		super(options, { service: 'ws_sr_padron_a13' });
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
	 * if it exists, returns idPersona property of response {@see 
	 * WS Specification item 3.2.2}
	 **/
	async getTaxpayerDetails(identifier) {
		// Get token and sign
		let { token, sign } = await this.afip.GetServiceTA('ws_sr_padron_a13');

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
	 * Asks to web service for tax id by document number
	 *
	 * @throws Exception if exists an error in response 
	 *
	 * @return object|null if taxpayer does not exists, return null,  
	 * if it exists, returns idPersona property of response
	 **/
	async getTaxIDByDocument(documentNumber) {
		// Get token and sign
		let { token, sign } = await this.afip.GetServiceTA('ws_sr_padron_a13');

		// Prepare SOAP params
		let params = {
			token, sign,
			cuitRepresentada: this.afip.CUIT,
			documento: documentNumber
		};
		
		return this.executeRequest('getIdPersonaListByDocumento', params)
		.then(res => res.idPersona)
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

		return results[
			operation === 'getPersona' ? 'personaReturn' :
				(operation === 'getIdPersonaListByDocumento' ? 'idPersonaListReturn': 'return')
			];
	}
}

