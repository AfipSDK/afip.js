export = AfipWebServiceError;

declare class AfipWebServiceError extends Error {
    code?: number;

    constructor(message: string, code?: number);
}