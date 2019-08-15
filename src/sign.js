var util = require('util'),
	spawn = require('child_process').spawn;

exports.sign = sign;

/**
 * Sign a file.
 *
 * @param {object} options Options
 * @param {string} options.key Key path
 * @param {string} options.cert Cert path
 * @param {string} options.passphrase Key passphrase
 * @returns {Promise} result Result
 */

function sign(options) {
	return new Promise(function (resolve, reject) {
		options = options || {};

		if (!options.content)
			reject('Invalid content.');

		if (!options.key)
			reject('Invalid key.');

		if (!options.cert)
			reject('Invalid certificate.');

		if (!options.openssl)
			options.openssl = 'openssl'

		var command = util.format(
			'smime -sign -signer %s -inkey %s -outform DER -nodetach',
			options.cert,
			options.key
		);

		if (options.passphrase)
			command += util.format(' -passin pass:%s', options.passphrase);

		var args = command.split(' ');
		var child = spawn(options.openssl, args, { encoding: 'base64' });

		var der = [];

		child.stdout.on('data', function (chunk) {
			der.push(chunk);
		});

		child.on('close', function (code) {
			if (code !== 0) {
				reject(new Error('Process failed.'));
			} else {
				resolve(Buffer.concat(der).toString('base64'));
			}
		});

		child.stdin.write(options.content);
		child.stdin.end();
	});
}
