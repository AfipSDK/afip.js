export = FacturaSDKError;
declare class FacturaSDKError extends Error {
    /**
     * Build the error from a request rejected by the API client
     *
     * Network errors (no response) are returned as they are
     *
     * @param {any} error Error with status, statusText and data of the response
     *
     * @return {any} FacturaSDKError, or the same error if there was no response
     **/
    static fromRequest(error: any): any;
    /**
     * Where the message, data_errors and errors live in a body: the body itself, or
     * `data` when the body is a failed automation
     *
     * @private
     **/
    private static detailOf;
    /**
     * { receiver: { vat_condition: 'mensaje' } } -> ['receiver.vat_condition: mensaje']
     *
     * @private
     **/
    private static flattenDataErrors;
    /**
     * @param {string} message
     * @param {{status?: number, data?: any}} [response]
     **/
    constructor(message: string, response?: {
        status?: number;
        data?: any;
    });
    /**
     * HTTP status of the response
     *
     * @type {number}
     **/
    status: number;
    /**
     * Body of the response
     *
     * @type {any}
     **/
    data: any;
    /**
     * Problems by field, nested like the request, or null
     *
     * @type {any}
     **/
    data_errors: any;
    /**
     * Rules that were not met, each with code and message, or null
     *
     * @type {Array<{code: string, message: string}>|null}
     **/
    errors: Array<{
        code: string;
        message: string;
    }> | null;
}
