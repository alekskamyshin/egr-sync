const pino = require('pino');
const { version: release_id } = require('../../package.json')

const parentLogger =  pino({
	level: 'info',
	transport: { target: 'pino-pretty'}
});

const childLogger = parentLogger.child({RELEASE_ID: release_id})

module.exports.logger = childLogger
