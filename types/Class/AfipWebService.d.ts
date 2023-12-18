export = AfipWebService;
declare class AfipWebService {
    constructor(webServiceOptions: any, options?: {});
    /**
     * Force to use SOAP Client version 1.2
     *
     * @var boolean
     **/
    soapv12: any;
    /**
     * File name for the Web Services Description Language
     *
     * @var string
     **/
    WSDL: any;
    /**
     * The url to web service
     *
     * @var string
     **/
    URL: any;
    /**
     * File name for the Web Services Description
     * Language in test mode
     *
     * @var string
     **/
    WSDL_TEST: any;
    /**
     * The url to web service in test mode
     *
     * @var string
     **/
    URL_TEST: any;
    /**
     * The Afip parent Class
     *
     * @var Afip
     **/
    afip: any;
    /**
     * Options
     *
     * @var object
     **/
    options: {};
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
    getTokenAuthorization(force?: boolean): Promise<any>;
    /**
     * Send request to AFIP servers
     *
     * @param {string} method SOAP operation to execute
     * @param {any} params Parameters to send
     **/
    executeRequest(method: string, params?: any): Promise<any>;
}
