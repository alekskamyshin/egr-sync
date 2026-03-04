const { ImportAutomation } = require('./utils/class.automation');
const { logger } = require('./utils/logger');
require('dotenv').config();

process.on('unhandledRejection', (reason) => {
	logger.error('Unhandled rejection: %s', reason instanceof Error ? reason.message : String(reason));
	process.exit(1);
});

process.on('uncaughtException', (error) => {
	logger.error('Uncaught exception: %s', error instanceof Error ? error.message : String(error));
	process.exit(1);
});

const run = async () =>  {
	try {
		const automation = ImportAutomation.fromFileDir(process.env.FILE_DIR)
		automation.loadFileNames()
		const files = automation.getFilePaths()
		logger.info('Loaded %s files', files?.length)
		await automation.processFiles()
		process.exit(0)
	} catch(e) {
		logger.error('Error: %s', e.message)
		process.exit(1)
	}
}

run()
