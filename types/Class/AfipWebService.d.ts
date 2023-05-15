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
     * @since 0.6
     *
     * @throws Error if an error occurs
     *
     * @return TokenAuthorization Token Authorization for AFIP Web Service
     **/
    getTokenAuthorization(): Promise<any>;
    /**
     * Send request to AFIP servers
     *
     * @param operation SOAP operation to execute
     * @param params Parameters to send
     **/
    executeRequest(operation: any, params?: {}): Promise<any>;
    soapClient: soap.Client;
}
import soap = require("soap");
