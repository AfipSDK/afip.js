export = Afip;
declare function Afip(options?: {}): Afip;
declare class Afip {
    constructor(options?: {});
    /** @private */
    private mixpanel;
    /** @private */
    private mixpanelRegister;
    options: {};
    CUIT: any;
    RES_FOLDER: any;
    TA_FOLDER: any;
    CERT: string;
    PRIVATEKEY: string;
    WSAA_WSDL: string;
    WSAA_URL: string;
    ElectronicBilling: ElectronicBilling;
    RegisterScopeFour: RegisterScopeFour;
    RegisterScopeFive: RegisterScopeFive;
    RegisterInscriptionProof: RegisterScopeFive;
    RegisterScopeTen: RegisterScopeTen;
    RegisterScopeThirteen: RegisterScopeThirteen;
    private GetServiceTA;
    /**
     * Create an TA from WSAA
     *
     * Request to WSAA for a tokent authorization for service
     * and save this in a json file
     *
     * @param service Service for token authorization
     **/
    CreateServiceTA(service: any): Promise<void>;
    private TrackUsage;
    /** @private */
    private AdminClient;
    /**
     * Create generic Web Service
     *
     * @param string service Web Service name
     * @param array options Web Service options
     *
     * @return AfipWebService Token Authorization for AFIP Web Service
     **/
    WebService(service: any, options: any): AfipWebService;
}
import ElectronicBilling = require("./Class/ElectronicBilling");
import RegisterScopeFour = require("./Class/RegisterScopeFour");
import RegisterScopeFive = require("./Class/RegisterScopeFive");
import RegisterScopeTen = require("./Class/RegisterScopeTen");
import RegisterScopeThirteen = require("./Class/RegisterScopeThirteen");
import AfipWebService = require("./Class/AfipWebService");
