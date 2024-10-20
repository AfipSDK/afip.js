
module.exports = class AfipWebServiceError extends Error {
	code;

	constructor(message, code) {
		super(message);
		this.code = code;
	}
}