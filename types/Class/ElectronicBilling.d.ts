export = ElectronicBilling;
declare class ElectronicBilling extends AfipWebService {
    constructor(afip: any);
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
    getLastVoucher(salesPoint: any, type: any): Promise<any>;
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
    createVoucher(data: any, returnResponse?: boolean): Promise<any>;
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
    createNextVoucher(data: any): Promise<any>;
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
    getVoucherInfo(number: any, salesPoint: any, type: any): Promise<any>;
    /**
     * Asks to AFIP Servers for sales points availables {@see WS
     * Specification item 4.11}
     *
     * @return array All sales points availables
     **/
    getSalesPoints(): Promise<any>;
    /**
     * Asks to AFIP Servers for voucher types availables {@see WS
     * Specification item 4.4}
     *
     * @return array All voucher types availables
     **/
    getVoucherTypes(): Promise<any>;
    /**
     * Asks to AFIP Servers for voucher concepts availables {@see WS
     * Specification item 4.5}
     *
     * @return array All voucher concepts availables
     **/
    getConceptTypes(): Promise<any>;
    /**
     * Asks to AFIP Servers for document types availables {@see WS
     * Specification item 4.6}
     *
     * @return array All document types availables
     **/
    getDocumentTypes(): Promise<any>;
    /**
     * Asks to AFIP Servers for aliquot availables {@see WS
     * Specification item 4.7}
     *
     * @return array All aliquot availables
     **/
    getAliquotTypes(): Promise<any>;
    /**
     * Asks to AFIP Servers for currencies availables {@see WS
     * Specification item 4.8}
     *
     * @return array All currencies availables
     **/
    getCurrenciesTypes(): Promise<any>;
    /**
     * Asks to AFIP Servers for voucher optional data available {@see WS
     * Specification item 4.9}
     *
     * @return array All voucher optional data available
     **/
    getOptionsTypes(): Promise<any>;
    /**
     * Asks to AFIP Servers for tax availables {@see WS
     * Specification item 4.10}
     *
     * @return array All tax availables
     **/
    getTaxTypes(): Promise<any>;
    /**
     * Asks to web service for servers status {@see WS
     * Specification item 4.14}
     *
     * @return object { AppServer : Web Service status,
     * DbServer : Database status, AuthServer : Autentication
     * server status}
     **/
    getServerStatus(): Promise<any>;
    /**
     * Change date from AFIP used format (yyyymmdd) to yyyy-mm-dd
     *
     * @param string|int date to format
     *
     * @return string date in format yyyy-mm-dd
     **/
    formatDate(date: any): any;
    /**
     * Make default request parameters for most of the operations
     *
     * @param string operation SOAP Operation to do
     *
     * @return array Request parameters
     **/
    getWSInitialRequest(operation: any): Promise<{
        Auth?: undefined;
    } | {
        Auth: {
            Token: any;
            Sign: any;
            Cuit: any;
        };
    }>;
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
    _checkErrors(operation: any, results: any): Promise<void>;
}
import AfipWebService = require("./AfipWebService");
