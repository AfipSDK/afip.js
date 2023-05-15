export = RegisterScopeThirteen;
declare class RegisterScopeThirteen extends AfipWebService {
    constructor(afip: any);
    /**
     * Asks to web service for servers status {@see WS
     * Specification item 3.1}
     *
     * @return object { appserver : Web Service status,
     * dbserver : Database status, authserver : Autentication
     * server status}
     **/
    getServerStatus(): Promise<any>;
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
    getTaxpayerDetails(identifier: any): Promise<any>;
    /**
     * Asks to web service for tax id by document number
     *
     * @throws Exception if exists an error in response
     *
     * @return object|null if taxpayer does not exists, return null,
     * if it exists, returns idPersona property of response
     **/
    getTaxIDByDocument(documentNumber: any): Promise<any>;
}
import AfipWebService = require("./AfipWebService");
