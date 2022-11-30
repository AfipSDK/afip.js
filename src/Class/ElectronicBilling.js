const AfipWebService = require('./AfipWebService');

/**
 * SDK for AFIP Electronic Billing (wsfe1)
 * 
 * @link http://www.afip.gob.ar/fe/documentos/manual_desarrollador_COMPG_v2_10.pdf WS Specification
 **/
module.exports = class ElectronicBilling extends AfipWebService {
	constructor(afip){
		const options = {
			soapV12: true,
			WSDL: 'wsfe-production.wsdl',
			URL: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx',
			WSDL_TEST: 'wsfe.wsdl',
			URL_TEST: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
			afip
		}

		super(options, { service: 'wsfe' });
	}

	/**
	 * Gets last voucher number 
	 * 
	 * Asks to Afip servers for number of the last voucher created for
	 * certain sales point and voucher type {@see WS Specification 
	 * item 4.15} 
	 *
	 * @param int salesPoint 	Sales point to ask for last voucher  
	 * @param int type 		Voucher type to ask for last voucher 
	 *
	 * @return int 
	 **/
	async getLastVoucher(salesPoint, type) {
		const req = {
			'PtoVta' 	: salesPoint,
			'CbteTipo' 	: type
		};

		return (await this.executeRequest('FECompUltimoAutorizado', req)).CbteNro;
	}

	/**
	 * Create a voucher from AFIP
	 *
	 * Send to AFIP servers request for create a voucher and assign 
	 * CAE to them {@see WS Specification item 4.1}
	 * 
	 * @param array data Voucher parameters {@see WS Specification 
	 * 	item 4.1.3}, some arrays were simplified for easy use {@example 
	 * 	examples/createVoucher.js Example with all allowed
	 * 	 attributes}
	 * @param bool returnResponse if is TRUE returns complete response  
	 * 	from AFIP
	 * 
	 * @return array if returnResponse is set to false returns 
	 * 	[CAE : CAE assigned to voucher, CAEFchVto : Expiration date 
	 * 	for CAE (yyyy-mm-dd)] else returns complete response from 
	 * 	AFIP {@see WS Specification item 4.1.3}
	 **/
	async createVoucher(data, returnResponse = false) {
		const req = {
			'FeCAEReq' : {
				'FeCabReq' : {
					'CantReg' 	: data['CbteHasta'] - data['CbteDesde'] + 1,
					'PtoVta' 	: data['PtoVta'],
					'CbteTipo' 	: data['CbteTipo']
				},
				'FeDetReq' : { 
					'FECAEDetRequest' : data
				}
			}
		};

		delete data['CantReg'];
		delete data['PtoVta'];
		delete data['CbteTipo'];

		if (data['Tributos']) 
			data['Tributos'] = { 'Tributo' : data['Tributos'] };

		if (data['Iva']) 
			data['Iva'] = { 'AlicIva' : data['Iva'] };
		
		if (data['CbtesAsoc']) 
			data['CbtesAsoc'] = { 'CbteAsoc' : data['CbtesAsoc'] };
		
		if (data['Compradores']) 
			data['Compradores'] = { 'Comprador' : data['Compradores'] };

		if (data['Opcionales']) 
			data['Opcionales'] = { 'Opcional' : data['Opcionales'] };

		const results = await this.executeRequest('FECAESolicitar', req);

		if (returnResponse === true) {
			return results;
		}
		else{
			if (Array.isArray(results.FeDetResp.FECAEDetResponse)) {
				results.FeDetResp.FECAEDetResponse = results.FeDetResp.FECAEDetResponse[0];
			}

			return {
				'CAE' 		: results.FeDetResp.FECAEDetResponse.CAE,
				'CAEFchVto' : this.formatDate(results.FeDetResp.FECAEDetResponse.CAEFchVto),
			};
		}
	}

	/**
	 * Create next voucher from AFIP
	 *
	 * This method combines Afip.getLastVoucher and Afip.createVoucher
	 * for create the next voucher
	 *
	 * @param array data Same to data in Afip.createVoucher except that
	 * 	don't need CbteDesde and CbteHasta attributes
	 *
	 * @return array [CAE : CAE assigned to voucher, CAEFchVto : Expiration 
	 * 	date for CAE (yyyy-mm-dd), voucherNumber : Number assigned to 
	 * 	voucher]
	 **/
	async createNextVoucher(data) {
		const lastVoucher = await this.getLastVoucher(data['PtoVta'], data['CbteTipo']);
		
		const voucherNumber = lastVoucher + 1;

		data['CbteDesde'] = voucherNumber;
		data['CbteHasta'] = voucherNumber;

		let res 				= await this.createVoucher(data);
		res['voucherNumber'] 	= voucherNumber;

		return res;
	}

	/**
	 * Get complete voucher information
	 *
	 * Asks to AFIP servers for complete information of voucher {@see WS 
	 * Specification item 4.19}
	 *
	 * @param int number 		Number of voucher to get information
	 * @param int salesPoint 	Sales point of voucher to get information
	 * @param int type 			Type of voucher to get information
	 *
	 * @return array|null returns array with complete voucher information 
	 * 	{@see WS Specification item 4.19} or null if there not exists 
	 **/
	async getVoucherInfo(number, salesPoint, type) {
		const req = {
			'FeCompConsReq' : {
				'CbteNro' 	: number,
				'PtoVta' 	: salesPoint,
				'CbteTipo' 	: type
			}
		};

		const result = await this.executeRequest('FECompConsultar', req)
		.catch(err => { if (err.code === 602) { return null } else { throw err }});

		return result.ResultGet;
	}

	/**
	 * Asks to AFIP Servers for sales points availables {@see WS 
	 * Specification item 4.11}
	 *
	 * @return array All sales points availables
	 **/
	async getSalesPoints() {
		return (await this.executeRequest('FEParamGetPtosVenta')).ResultGet.PtoVenta;
	}

	/**
	 * Asks to AFIP Servers for voucher types availables {@see WS 
	 * Specification item 4.4}
	 *
	 * @return array All voucher types availables
	 **/
	async getVoucherTypes() {
		return (await this.executeRequest('FEParamGetTiposCbte')).ResultGet.CbteTipo;
	}

	/**
	 * Asks to AFIP Servers for voucher concepts availables {@see WS 
	 * Specification item 4.5}
	 *
	 * @return array All voucher concepts availables
	 **/
	async getConceptTypes() {
		return (await this.executeRequest('FEParamGetTiposConcepto')).ResultGet.ConceptoTipo;
	}

	/**
	 * Asks to AFIP Servers for document types availables {@see WS 
	 * Specification item 4.6}
	 *
	 * @return array All document types availables
	 **/
	async getDocumentTypes() {
		return (await this.executeRequest('FEParamGetTiposDoc')).ResultGet.DocTipo;
	}

	/**
	 * Asks to AFIP Servers for aliquot availables {@see WS 
	 * Specification item 4.7}
	 *
	 * @return array All aliquot availables
	 **/
	async getAliquotTypes() {
		return (await this.executeRequest('FEParamGetTiposIva')).ResultGet.IvaTipo;
	}

	/**
	 * Asks to AFIP Servers for currencies availables {@see WS 
	 * Specification item 4.8}
	 *
	 * @return array All currencies availables
	 **/
	async getCurrenciesTypes() {
		return (await this.executeRequest('FEParamGetTiposMonedas')).ResultGet.Moneda;
	}

	/**
	 * Asks to AFIP Servers for voucher optional data available {@see WS 
	 * Specification item 4.9}
	 *
	 * @return array All voucher optional data available
	 **/
	async getOptionsTypes() {
		return (await this.executeRequest('FEParamGetTiposOpcional')).ResultGet.OpcionalTipo;
	}

	/**
	 * Asks to AFIP Servers for tax availables {@see WS 
	 * Specification item 4.10}
	 *
	 * @return array All tax availables
	 **/
	async getTaxTypes() {
		return (await this.executeRequest('FEParamGetTiposTributos')).ResultGet.TributoTipo;
	}

	/**
	 * Asks to web service for servers status {@see WS 
	 * Specification item 4.14}
	 *
	 * @return object { AppServer : Web Service status, 
	 * DbServer : Database status, AuthServer : Autentication 
	 * server status}
	 **/
	async getServerStatus() {
		return await this.executeRequest('FEDummy');
	}

	/**
	 * Change date from AFIP used format (yyyymmdd) to yyyy-mm-dd
	 *
	 * @param string|int date to format
	 *
	 * @return string date in format yyyy-mm-dd
	 **/
	formatDate(date) {
		return date.toString()
		.replace(/(\d{4})(\d{2})(\d{2})/, (string, year, month, day) => `${year}-${month}-${day}`);
	}

	/**
	 * Sends request to AFIP servers
	 * 
	 * @param string 	operation 	SOAP operation to do 
	 * @param array 	params 	Parameters to send
	 *
	 * @return mixed Operation results 
	 **/
	async executeRequest(operation, params = {})
	{
		Object.assign(params, await this.getWSInitialRequest(operation)); 

		const results = await super.executeRequest(operation, params);

		await this._checkErrors(operation, results);

		return results[operation+'Result'];
	}

	/**
	 * Make default request parameters for most of the operations
	 * 
	 * @param string operation SOAP Operation to do 
	 *
	 * @return array Request parameters  
	 **/
	async getWSInitialRequest(operation)
	{
		if (operation === 'FEDummy') {
			return {};
		}

		const { token, sign } = await this.afip.GetServiceTA('wsfe');

		return {
			'Auth' : { 
				'Token' : token,
				'Sign' 	: sign,
				'Cuit' 	: this.afip.CUIT
				}
		};
	}

	/**
	 * Check if occurs an error on Web Service request
	 * 
	 * @param string 	operation 	SOAP operation to check 
	 * @param mixed 	results 	AFIP response
	 *
	 * @throws Exception if exists an error in response 
	 * 
	 * @return void 
	 **/
	async _checkErrors(operation, results)
	{
		const res = results[operation+'Result'];

		if (operation === 'FECAESolicitar' && res.FeDetResp) {
			if (Array.isArray(res.FeDetResp.FECAEDetResponse)) {
				res.FeDetResp.FECAEDetResponse = res.FeDetResp.FECAEDetResponse[0];
			}
			
			if (res.FeDetResp.FECAEDetResponse.Observaciones && res.FeDetResp.FECAEDetResponse.Resultado !== 'A') {
				res.Errors = { Err : res.FeDetResp.FECAEDetResponse.Observaciones.Obs };
			}
		}

		if (res.Errors) {
			const err = Array.isArray(res.Errors.Err) ? res.Errors.Err[0] : res.Errors.Err;
			throw new Error(`(${err.Code}) ${err.Msg}`, err.Code);
		}
	}

}

