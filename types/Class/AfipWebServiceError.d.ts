export = AfipWebServiceError;
declare class AfipWebServiceError extends Error {
    constructor(message: any, code: any);
    code: any;
}
