export = Afip;
declare function Afip(options?: {}): Afip;
declare class Afip {
    constructor(options?: {});
    /**
     * SDK version
     **/
    sdk_version_number: string;
    options: {};
    CUIT: any;
    CERT: any;
    PRIVATEKEY: any;
    /** @private */
    private AdminClient;
    ElectronicBilling: ElectronicBilling;
    RegisterScopeFour: RegisterScopeFour;
    RegisterScopeFive: RegisterScopeFive;
    RegisterInscriptionProof: RegisterInscriptionProof;
    RegisterScopeTen: RegisterScopeTen;
    RegisterScopeThirteen: RegisterScopeThirteen;
    private GetServiceTA;
    /**
     * Get last request and last response XML
     **/
    getLastRequestXML(): Promise<any>;
    /**
     * Create generic Web Service
     *
     * @param {string} service Web Service name
     * @param {any} options Web Service options
     *
     * @return AfipWebService Token Authorization for AFIP Web Service
     **/
    WebService(service: string, options?: any): AfipWebService;
}
import ElectronicBilling = require("./Class/ElectronicBilling");
import RegisterScopeFour = require("./Class/RegisterScopeFour");
import RegisterScopeFive = require("./Class/RegisterScopeFive");
import RegisterInscriptionProof = require("./Class/RegisterInscriptionProof");
import RegisterScopeTen = require("./Class/RegisterScopeTen");
import RegisterScopeThirteen = require("./Class/RegisterScopeThirteen");
import AfipWebService = require("./Class/AfipWebService");
