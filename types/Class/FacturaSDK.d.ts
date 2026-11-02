export = FacturaSDK;
declare class FacturaSDK {
    constructor(afip: any);
    /**
     * The Afip parent Class
     *
     * @var Afip
     **/
    afip: any;
    /** @private */
    private client;
    /**
     * Issue an invoice
     *
     * By default Factura SDK answers right away with the invoice queued and
     * authorizes it in ARCA in the background: the result arrives at your
     * webhook. With `wait` the method polls until the invoice is decided;
     * with `sync: true` in the data Factura SDK decides it within the request.
     *
     * @param {object} data Invoice data {@see https://afipsdk.com/docs/facturasdk/invoices}. In the sandbox, `sandbox: { result }` forces the outcome
     * @param {CreateInvoiceOptions} [options]
     *
     * @return {Promise<any>} The invoice
     **/
    createInvoice(data: object, options?: CreateInvoiceOptions): Promise<any>;
    /**
     * Get an invoice with its current status
     *
     * @param {string} id Id of the invoice
     * @param {boolean} [wait=false] Wait until the invoice reaches a final status
     *
     * @return {Promise<any>} The invoice
     **/
    getInvoice(id: string, wait?: boolean): Promise<any>;
    /**
     * Wait for an invoice to be decided: approved, rejected or failed
     *
     * Polls the invoice every 2 seconds for up to 2 minutes. The invoice keeps
     * its course in Factura SDK if the wait ends; the result still arrives at
     * your webhook
     *
     * @param {string} id Id of the invoice
     *
     * @return {Promise<any>} The invoice
     **/
    waitForInvoice(id: string): Promise<any>;
    /**
     * List invoices, newest first, with cursor pagination
     *
     * @param {object} [params] Filters: issuer_cuit, status, invoice_type, start, end, limit, cursor
     *
     * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
     **/
    getInvoices(params?: object): Promise<{
        data: any[];
        next_cursor: string | null;
        total_count: number;
    }>;
    /**
     * Cancel an invoice that is still queued. It never gets issued
     *
     * @param {string} id Id of the invoice
     *
     * @return {Promise<any>} The invoice, cancelled
     **/
    cancelInvoice(id: string): Promise<any>;
    /**
     * Create an issuer: a tax id that invoices. It is created pending and
     * invoices once verified
     *
     * @param {object} data Issuer data {@see https://afipsdk.com/docs/facturasdk/issuers}
     *
     * @return {Promise<any>} The issuer
     **/
    createIssuer(data: object): Promise<any>;
    /**
     * Get an issuer
     *
     * @param {string} id Id of the issuer
     *
     * @return {Promise<any>} The issuer
     **/
    getIssuer(id: string): Promise<any>;
    /**
     * List issuers, with cursor pagination
     *
     * @param {object} [params] Filters: tax_id, certificate_id, status, limit, cursor
     *
     * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
     **/
    getIssuers(params?: object): Promise<{
        data: any[];
        next_cursor: string | null;
        total_count: number;
    }>;
    /**
     * Update an issuer: only the fields sent change
     *
     * @param {string} id Id of the issuer
     * @param {object} data Fields to change: fiscal data, sales_point, certificate_id or status
     *
     * @return {Promise<any>} The issuer, updated
     **/
    updateIssuer(id: string, data: object): Promise<any>;
    /**
     * Delete an issuer. Its invoices remain
     *
     * @param {string} id Id of the issuer
     *
     * @return {Promise<void>}
     **/
    deleteIssuer(id: string): Promise<void>;
    /**
     * Get the data of a tax id from its registration certificate in ARCA, to
     * create the issuer without typing them
     *
     * @param {string|number} taxId Tax id (CUIT)
     *
     * @return {Promise<any>} tax_id, issuer (the fields found), unresolved, warnings, taxpayer and inscription_proof
     **/
    lookupIssuer(taxId: string | number): Promise<any>;
    /**
     * List the sales points of a tax id in ARCA, with its tax password
     *
     * It is an automation: with `wait` returns it finished, with the sales
     * points in `data`
     *
     * @param {object} data tax_id, username and password
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The automation
     **/
    getSalesPoints(data: object, wait?: boolean): Promise<any>;
    /**
     * Create in ARCA a sales point for web services for a tax id, with its
     * tax password
     *
     * It is an automation: with `wait` returns it finished, with the sales
     * point in `data`
     *
     * @param {object} data tax_id, username, password and optionally vat_condition, number, name, system
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The automation
     **/
    createSalesPoint(data: object, wait?: boolean): Promise<any>;
    /**
     * Create a certificate for the issuer and assign it
     *
     * Uploaded (cert and key in PEM) it answers the certificate. Created in
     * ARCA (source "automation", with username and password) it is an
     * automation: with `wait` returns it finished, with the certificate in `data`
     *
     * @param {string} id Id of the issuer
     * @param {object} data Certificate data {@see https://afipsdk.com/docs/facturasdk/certificates}
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The certificate, or the automation
     **/
    createIssuerCertificate(id: string, data: object, wait?: boolean): Promise<any>;
    /**
     * Accept in ARCA the delegation of the issuer to the owner of its
     * certificate and authorize the certificate to invoice for it, with the
     * tax password of the certificate owner
     *
     * It is an automation: with `wait` returns it finished
     *
     * @param {string} id Id of the issuer
     * @param {object} data username and password of the certificate owner
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The automation
     **/
    createIssuerDelegation(id: string, data: object, wait?: boolean): Promise<any>;
    /**
     * Verify an issuer: issues a $1 invoice and the credit note that cancels
     * it, and the issuer becomes active. In production both vouchers are real
     *
     * It is an automation: with `wait` returns it finished, with verified,
     * issuer, invoice and credit_note in `data`
     *
     * @param {string} id Id of the issuer
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The automation
     **/
    verifyIssuer(id: string, wait?: boolean): Promise<any>;
    /**
     * Add a certificate to the project
     *
     * Uploaded (cert and key in PEM) it answers the certificate. Created in
     * ARCA (source "automation", with tax_id, username and password) it is an
     * automation: with `wait` returns it finished, with the certificate in `data`
     *
     * @param {object} data Certificate data {@see https://afipsdk.com/docs/facturasdk/certificates}
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The certificate, or the automation
     **/
    createCertificate(data: object, wait?: boolean): Promise<any>;
    /**
     * Get a certificate
     *
     * @param {string} id Id of the certificate
     *
     * @return {Promise<any>} The certificate
     **/
    getCertificate(id: string): Promise<any>;
    /**
     * List certificates, with cursor pagination
     *
     * @param {object} [params] Filters: tax_id, search, status, limit, cursor
     *
     * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
     **/
    getCertificates(params?: object): Promise<{
        data: any[];
        next_cursor: string | null;
        total_count: number;
    }>;
    /**
     * Revoke a certificate: it no longer signs
     *
     * @param {string} id Id of the certificate
     *
     * @return {Promise<any>} The certificate, revoked
     **/
    revokeCertificate(id: string): Promise<any>;
    /**
     * Renew a certificate in place: it keeps its id, so the issuers that use
     * it keep invoicing with the new one
     *
     * Uploaded (cert and key in PEM) it answers the certificate. Renewed in
     * ARCA (source "automation", with username and password) it is an
     * automation: with `wait` returns it finished, with the certificate and
     * `renewed: true` in `data`. A revoked certificate can not be renewed
     *
     * @param {string} id Id of the certificate
     * @param {object} data Certificate data {@see https://afipsdk.com/docs/facturasdk/certificates}
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The certificate, or the automation
     **/
    renewCertificate(id: string, data: object, wait?: boolean): Promise<any>;
    /**
     * Delete a certificate: it disappears from the project without being
     * revoked in ARCA. The issuers that used it keep their reference
     *
     * @param {string} id Id of the certificate
     *
     * @return {Promise<void>}
     **/
    deleteCertificate(id: string): Promise<void>;
    /**
     * Authorize a certificate in ARCA for the electronic billing web service
     * (wsfe), with the tax password of its owner
     *
     * It is an automation: with `wait` returns it finished
     *
     * @param {string} id Id of the certificate
     * @param {object} data password and optionally username
     * @param {boolean} [wait=true] Wait for the automation to finish
     *
     * @return {Promise<any>} The automation
     **/
    authorizeCertificate(id: string, data: object, wait?: boolean): Promise<any>;
    /**
     * Create the webhook endpoint: the URL where Factura SDK posts the result
     * of each invoice. The answer brings the secret, shown only this once
     *
     * @param {object} data url
     *
     * @return {Promise<any>} The endpoint, with its secret
     **/
    createWebhookEndpoint(data: object): Promise<any>;
    /**
     * Get a webhook endpoint
     *
     * @param {string} id Id of the endpoint
     *
     * @return {Promise<any>} The endpoint
     **/
    getWebhookEndpoint(id: string): Promise<any>;
    /**
     * List webhook endpoints
     *
     * @param {object} [params] Filters: status, limit, cursor
     *
     * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
     **/
    getWebhookEndpoints(params?: object): Promise<{
        data: any[];
        next_cursor: string | null;
        total_count: number;
    }>;
    /**
     * Update a webhook endpoint: url or status (active or inactive)
     *
     * @param {string} id Id of the endpoint
     * @param {object} data Fields to change
     *
     * @return {Promise<any>} The endpoint, updated
     **/
    updateWebhookEndpoint(id: string, data: object): Promise<any>;
    /**
     * Generate a new secret for a webhook endpoint. From then on every
     * delivery is signed with it
     *
     * @param {string} id Id of the endpoint
     *
     * @return {Promise<any>} The endpoint, with the new secret
     **/
    rotateWebhookEndpointSecret(id: string): Promise<any>;
    /**
     * Send a signed test event to a webhook endpoint
     *
     * @param {string} id Id of the endpoint
     *
     * @return {Promise<any>} delivered, http_status, error and the delivery
     **/
    testWebhookEndpoint(id: string): Promise<any>;
    /**
     * List the deliveries of a webhook endpoint: what was sent, when and with
     * what result
     *
     * @param {string} id Id of the endpoint
     * @param {object} [params] Filters: status, invoice_id, limit, cursor
     *
     * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
     **/
    getWebhookDeliveries(id: string, params?: object): Promise<{
        data: any[];
        next_cursor: string | null;
        total_count: number;
    }>;
    /**
     * Verify the signature of a webhook delivery
     *
     * The X-FacturaSDK-Signature header is "t=<timestamp>,v1=<signature>",
     * where v1 is the HMAC-SHA256 of "<timestamp>.<body>" with the secret of
     * the endpoint. The body has to be the raw one received, byte by byte
     *
     * @param {string} signature Value of the X-FacturaSDK-Signature header
     * @param {string|Buffer} body Raw body of the request
     * @param {string} secret Secret of the endpoint
     * @param {number} [tolerance=300] Seconds the timestamp may differ from now
     *
     * @return {boolean}
     **/
    verifyWebhookSignature(signature: string, body: string | Buffer, secret: string, tolerance?: number): boolean;
    /**
     * Verify the signature of a webhook delivery and parse its event
     *
     * @param {string|Buffer} body Raw body of the request
     * @param {string} signature Value of the X-FacturaSDK-Signature header
     * @param {string} secret Secret of the endpoint
     * @param {number} [tolerance=300] Seconds the timestamp may differ from now
     *
     * @throws {FacturaSDKError} if the signature is not valid
     *
     * @return {any} The event: event_id, type, created and data
     **/
    constructWebhookEvent(body: string | Buffer, signature: string, secret: string, tolerance?: number): any;
    /**
     * Get an automation
     *
     * @param {string} id Id of the automation
     * @param {boolean} [wait=false] Wait for the automation to finish
     *
     * @throws {FacturaSDKError} if the automation finished with an error
     *
     * @return {Promise<{id: string, status: string, data?: any}>}
     **/
    getAutomation(id: string, wait?: boolean): Promise<{
        id: string;
        status: string;
        data?: any;
    }>;
    /**
     * Wait for an automation to finish
     *
     * Polls it every 3 seconds for up to 3 minutes
     *
     * @param {string} id Id of the automation
     *
     * @throws {FacturaSDKError} if the automation finished with an error
     *
     * @return {Promise<{id: string, status: string, data?: any}>}
     **/
    waitForAutomation(id: string): Promise<{
        id: string;
        status: string;
        data?: any;
    }>;
    /**
     * Resolve the answer of an endpoint that may start an automation: when it
     * did (202 with automation_id) and `wait` is set, waits for it to finish
     *
     * @private
     **/
    private automation;
    /**
     * Send a request to the Factura SDK API
     *
     * @param {string} method HTTP method
     * @param {string} path Path after /v1/
     * @param {{data?: any, params?: any, headers?: any}} [options]
     *
     * @throws {FacturaSDKError} if the API answers an error
     *
     * @private
     **/
    private request;
}
declare namespace FacturaSDK {
    export { CreateInvoiceOptions };
}
type CreateInvoiceOptions = {
    /**
     * Identifier of the sale in your system. Repeating it returns the same invoice instead of issuing another one
     */
    idempotency_key?: string;
    /**
     * Wait until the invoice reaches a final status (approved, rejected or failed) instead of returning it queued
     */
    wait?: boolean;
};
