const crypto = require('crypto');

const FacturaSDKError = require('./FacturaSDKError');

// Automations (ARCA with the tax password, verification) take from seconds to a couple of minutes
const AUTOMATION_INTERVAL_MS = 3000;
const AUTOMATION_ATTEMPTS = 60;

// An invoice is authorized in the background in seconds
const INVOICE_INTERVAL_MS = 2000;
const INVOICE_ATTEMPTS = 60;

const PENDING_INVOICE_STATUSES = ['queued', 'processing'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @typedef {Object} CreateInvoiceOptions
 * @property {string} [idempotency_key] Identifier of the sale in your system. Repeating it returns the same invoice instead of issuing another one
 * @property {boolean} [wait=false] Wait until the invoice reaches a final status (approved, rejected or failed) instead of returning it queued
 */

/**
 * SDK for Factura SDK: electronic invoicing end to end
 *
 * Issuers, certificates, invoices and webhooks of a Factura SDK project.
 * The access token (fsk_dev_… for the sandbox, fsk_prod_… for production)
 * decides the environment.
 *
 * @link https://afipsdk.com/docs/facturasdk/
 **/
module.exports = class FacturaSDK {
	constructor(afip) {
		/**
		 * The Afip parent Class
		 *
		 * @var Afip
		 **/
		this.afip = afip;

		// Own token when the project of Afip SDK is another one; otherwise the access token of Afip
		const accessToken = afip.options['facturasdk_access_token'];

		/** @private */
		this.client = accessToken
			? afip.createAdminClient(accessToken, /^fsk_prod_/.test(accessToken) ? 'prod' : 'dev')
			: afip.AdminClient;
	}

	// Invoices

	/**
	 * Issue an invoice
	 *
	 * By default Factura SDK answers right away with the invoice queued and
	 * authorizes it in ARCA in the background: the result arrives at your
	 * webhook. With `wait` the method polls until the invoice is decided;
	 * with `sync: true` in the data Factura SDK decides it within the request.
	 *
	 * @param {object} data Invoice data {@see https://afipsdk.com/docs/facturasdk/invoices}
	 * @param {CreateInvoiceOptions} [options]
	 *
	 * @return {Promise<any>} The invoice
	 **/
	async createInvoice(data, options = {}) {
		const headers = options.idempotency_key ? { 'Idempotency-Key': options.idempotency_key } : {};

		const invoice = await this.request('post', 'invoices', { data, headers });

		if (options.wait === true && PENDING_INVOICE_STATUSES.includes(invoice.status)) {
			return this.waitForInvoice(invoice.id);
		}

		return invoice;
	}

	/**
	 * Get an invoice with its current status
	 *
	 * @param {string} id Id of the invoice
	 * @param {boolean} [wait=false] Wait until the invoice reaches a final status
	 *
	 * @return {Promise<any>} The invoice
	 **/
	async getInvoice(id, wait = false) {
		if (wait === true) {
			return this.waitForInvoice(id);
		}

		return this.request('get', `invoices/${id}`);
	}

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
	async waitForInvoice(id) {
		let attempts = INVOICE_ATTEMPTS;

		while (attempts-- > 0) {
			const invoice = await this.request('get', `invoices/${id}`);

			if (!PENDING_INVOICE_STATUSES.includes(invoice.status)) {
				return invoice;
			}

			await sleep(INVOICE_INTERVAL_MS);
		}

		throw new Error('Error: Waiting for too long');
	}

	/**
	 * List invoices, newest first, with cursor pagination
	 *
	 * @param {object} [params] Filters: issuer_cuit, status, invoice_type, start, end, limit, cursor
	 *
	 * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
	 **/
	async getInvoices(params = {}) {
		return this.request('get', 'invoices', { params });
	}

	/**
	 * Cancel an invoice that is still queued. It never gets issued
	 *
	 * @param {string} id Id of the invoice
	 *
	 * @return {Promise<any>} The invoice, cancelled
	 **/
	async cancelInvoice(id) {
		return this.request('post', `invoices/${id}/cancel`);
	}

	// Issuers

	/**
	 * Create an issuer: a tax id that invoices. It is created pending and
	 * invoices once verified
	 *
	 * @param {object} data Issuer data {@see https://afipsdk.com/docs/facturasdk/issuers}
	 *
	 * @return {Promise<any>} The issuer
	 **/
	async createIssuer(data) {
		return this.request('post', 'issuers', { data });
	}

	/**
	 * Get an issuer
	 *
	 * @param {string} id Id of the issuer
	 *
	 * @return {Promise<any>} The issuer
	 **/
	async getIssuer(id) {
		return this.request('get', `issuers/${id}`);
	}

	/**
	 * List issuers, with cursor pagination
	 *
	 * @param {object} [params] Filters: tax_id, certificate_id, status, limit, cursor
	 *
	 * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
	 **/
	async getIssuers(params = {}) {
		return this.request('get', 'issuers', { params });
	}

	/**
	 * Update an issuer: only the fields sent change
	 *
	 * @param {string} id Id of the issuer
	 * @param {object} data Fields to change: fiscal data, sales_point, certificate_id or status
	 *
	 * @return {Promise<any>} The issuer, updated
	 **/
	async updateIssuer(id, data) {
		return this.request('put', `issuers/${id}`, { data });
	}

	/**
	 * Delete an issuer. Its invoices remain
	 *
	 * @param {string} id Id of the issuer
	 *
	 * @return {Promise<void>}
	 **/
	async deleteIssuer(id) {
		await this.request('delete', `issuers/${id}`);
	}

	/**
	 * Get the data of a tax id from its registration certificate in ARCA, to
	 * create the issuer without typing them
	 *
	 * @param {string|number} taxId Tax id (CUIT)
	 *
	 * @return {Promise<any>} tax_id, issuer (the fields found), unresolved, warnings, taxpayer and inscription_proof
	 **/
	async lookupIssuer(taxId) {
		return this.request('get', 'issuers/lookup', { params: { tax_id: taxId } });
	}

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
	async getSalesPoints(data, wait = true) {
		return this.automation(this.request('post', 'issuers/sales-points', { data }), wait);
	}

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
	async createSalesPoint(data, wait = true) {
		return this.automation(this.request('post', 'issuers/sales-points/create', { data }), wait);
	}

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
	async createIssuerCertificate(id, data, wait = true) {
		return this.automation(this.request('post', `issuers/${id}/certificate`, { data }), wait);
	}

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
	async createIssuerDelegation(id, data, wait = true) {
		return this.automation(this.request('post', `issuers/${id}/delegation`, { data }), wait);
	}

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
	async verifyIssuer(id, wait = true) {
		return this.automation(this.request('post', `issuers/${id}/verify`), wait);
	}

	// Certificates

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
	async createCertificate(data, wait = true) {
		return this.automation(this.request('post', 'certificates', { data }), wait);
	}

	/**
	 * Get a certificate
	 *
	 * @param {string} id Id of the certificate
	 *
	 * @return {Promise<any>} The certificate
	 **/
	async getCertificate(id) {
		return this.request('get', `certificates/${id}`);
	}

	/**
	 * List certificates, with cursor pagination
	 *
	 * @param {object} [params] Filters: tax_id, status, limit, cursor
	 *
	 * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
	 **/
	async getCertificates(params = {}) {
		return this.request('get', 'certificates', { params });
	}

	/**
	 * Revoke a certificate: it no longer signs
	 *
	 * @param {string} id Id of the certificate
	 *
	 * @return {Promise<any>} The certificate, revoked
	 **/
	async revokeCertificate(id) {
		return this.request('post', `certificates/${id}/revoke`);
	}

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
	async authorizeCertificate(id, data, wait = true) {
		return this.automation(this.request('post', `certificates/${id}/authorize`, { data }), wait);
	}

	// Webhooks

	/**
	 * Create the webhook endpoint: the URL where Factura SDK posts the result
	 * of each invoice. The answer brings the secret, shown only this once
	 *
	 * @param {object} data url
	 *
	 * @return {Promise<any>} The endpoint, with its secret
	 **/
	async createWebhookEndpoint(data) {
		return this.request('post', 'webhook-endpoints', { data });
	}

	/**
	 * Get a webhook endpoint
	 *
	 * @param {string} id Id of the endpoint
	 *
	 * @return {Promise<any>} The endpoint
	 **/
	async getWebhookEndpoint(id) {
		return this.request('get', `webhook-endpoints/${id}`);
	}

	/**
	 * List webhook endpoints
	 *
	 * @param {object} [params] Filters: status
	 *
	 * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
	 **/
	async getWebhookEndpoints(params = {}) {
		return this.request('get', 'webhook-endpoints', { params });
	}

	/**
	 * Update a webhook endpoint: url or status (active or inactive)
	 *
	 * @param {string} id Id of the endpoint
	 * @param {object} data Fields to change
	 *
	 * @return {Promise<any>} The endpoint, updated
	 **/
	async updateWebhookEndpoint(id, data) {
		return this.request('put', `webhook-endpoints/${id}`, { data });
	}

	/**
	 * Generate a new secret for a webhook endpoint. From then on every
	 * delivery is signed with it
	 *
	 * @param {string} id Id of the endpoint
	 *
	 * @return {Promise<any>} The endpoint, with the new secret
	 **/
	async rotateWebhookEndpointSecret(id) {
		return this.request('post', `webhook-endpoints/${id}/rotate`);
	}

	/**
	 * Send a signed test event to a webhook endpoint
	 *
	 * @param {string} id Id of the endpoint
	 *
	 * @return {Promise<any>} delivered, http_status, error and the delivery
	 **/
	async testWebhookEndpoint(id) {
		return this.request('post', `webhook-endpoints/${id}/test`);
	}

	/**
	 * List the deliveries of a webhook endpoint: what was sent, when and with
	 * what result
	 *
	 * @param {string} id Id of the endpoint
	 * @param {object} [params] Filters: status, invoice_id, limit, cursor
	 *
	 * @return {Promise<{data: any[], next_cursor: string|null, total_count: number}>}
	 **/
	async getWebhookDeliveries(id, params = {}) {
		return this.request('get', `webhook-endpoints/${id}/deliveries`, { params });
	}

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
	verifyWebhookSignature(signature, body, secret, tolerance = 300) {
		if (typeof signature !== 'string' || !secret) {
			return false;
		}

		const parts = Object.fromEntries(signature.split(',').map((part) => part.split('=')));
		const timestamp = parseInt(parts.t, 10);
		const received = parts.v1 || '';

		if (!Number.isFinite(timestamp)) {
			return false;
		}

		const payload = Buffer.isBuffer(body) ? body.toString('utf8') : String(body);

		const expected = crypto
			.createHmac('sha256', secret)
			.update(`${timestamp}.${payload}`)
			.digest('hex');

		const fresh = Math.abs(Math.floor(Date.now() / 1000) - timestamp) <= tolerance;

		return fresh && received.length === expected.length && crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
	}

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
	constructWebhookEvent(body, signature, secret, tolerance = 300) {
		if (!this.verifyWebhookSignature(signature, body, secret, tolerance)) {
			throw new FacturaSDKError('La firma del webhook no es válida');
		}

		return JSON.parse(Buffer.isBuffer(body) ? body.toString('utf8') : String(body));
	}

	// Automations

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
	async getAutomation(id, wait = false) {
		if (wait === true) {
			return this.waitForAutomation(id);
		}

		return this.request('get', `automations/${id}`);
	}

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
	async waitForAutomation(id) {
		let attempts = AUTOMATION_ATTEMPTS;

		while (attempts-- > 0) {
			const automation = await this.request('get', `automations/${id}`);

			if (automation.status !== 'in_process') {
				return automation;
			}

			await sleep(AUTOMATION_INTERVAL_MS);
		}

		throw new Error('Error: Waiting for too long');
	}

	/**
	 * Resolve the answer of an endpoint that may start an automation: when it
	 * did (202 with automation_id) and `wait` is set, waits for it to finish
	 *
	 * @private
	 **/
	async automation(pending, wait) {
		const result = await pending;

		if (wait === true && result && result.automation_id) {
			return this.waitForAutomation(result.automation_id);
		}

		return result;
	}

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
	async request(method, path, { data, params, headers } = {}) {
		try {
			const response = await this.client.request({ method, url: `v1/${path}`, data, params, headers });

			return response.data;
		} catch (error) {
			throw FacturaSDKError.fromRequest(error);
		}
	}
}
