/**
 * Error of the Factura SDK API
 *
 * Carries the HTTP status and the body of the response: `message`, the
 * problems by field in `data_errors` and the rules the invoice did not
 * meet in `errors` {@see https://afipsdk.com/docs/facturasdk/errors}
 **/
module.exports = class FacturaSDKError extends Error {
	/**
	 * HTTP status of the response
	 *
	 * @type {number}
	 **/
	status;

	/**
	 * Body of the response
	 *
	 * @type {any}
	 **/
	data;

	/**
	 * Problems by field, nested like the request, or null
	 *
	 * @type {any}
	 **/
	data_errors;

	/**
	 * Rules that were not met, each with code and message, or null
	 *
	 * @type {Array<{code: string, message: string}>|null}
	 **/
	errors;

	/**
	 * @param {string} message
	 * @param {{status?: number, data?: any}} [response]
	 **/
	constructor(message, response = {}) {
		super(message);

		this.name = 'FacturaSDKError';
		this.status = response.status;
		this.data = response.data;

		// A failed automation answers { status: 'error', data: { message, data_errors, errors } }
		const detail = FacturaSDKError.detailOf(response.data);

		this.data_errors = detail.data_errors && typeof detail.data_errors === 'object' ? detail.data_errors : null;
		this.errors = Array.isArray(detail.errors) ? detail.errors : null;
	}

	/**
	 * Build the error from a request rejected by the API client
	 *
	 * Network errors (no response) are returned as they are
	 *
	 * @param {any} error Error with status, statusText and data of the response
	 *
	 * @return {any} FacturaSDKError, or the same error if there was no response
	 **/
	static fromRequest(error) {
		if (!error || !error.status) {
			return error;
		}

		const data = error.data || {};
		const detail = FacturaSDKError.detailOf(data);
		const parts = [];

		if (detail.message) {
			parts.push(detail.message);
		}

		if (Array.isArray(detail.errors)) {
			parts.push(...detail.errors.map((item) => `${item.code}: ${item.message}`));
		}

		if (detail.data_errors && typeof detail.data_errors === 'object') {
			parts.push(...FacturaSDKError.flattenDataErrors(detail.data_errors));
		}

		const message = parts.length > 0 ? parts.join(' ') : `Factura SDK respondió ${error.status}${error.statusText ? ` ${error.statusText}` : ''}`;

		return new FacturaSDKError(message, { status: error.status, data });
	}

	/**
	 * Where the message, data_errors and errors live in a body: the body itself, or
	 * `data` when the body is a failed automation
	 *
	 * @private
	 **/
	static detailOf(data) {
		if (!data || typeof data !== 'object') {
			return {};
		}

		return data.status === 'error' && data.data && typeof data.data === 'object' ? data.data : data;
	}

	/**
	 * { receiver: { vat_condition: 'mensaje' } } -> ['receiver.vat_condition: mensaje']
	 *
	 * @private
	 **/
	static flattenDataErrors(errors, prefix = '') {
		return Object.entries(errors).flatMap(([field, value]) => {
			const path = prefix ? `${prefix}.${field}` : field;

			return value && typeof value === 'object' ? FacturaSDKError.flattenDataErrors(value, path) : [`${path}: ${value}`];
		});
	}
}
