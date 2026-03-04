const pLimit = require('p-limit');
const { parseFile } = require("../parsers/egrn.xml.parser")
const { CompanyRecord } = require("../records/class.company.record")
const { CompanyRepository } = require("../repositories/class.company.registry")
const FileManager = require("./class.file.manager")
const { logger } = require("./logger")
const { withTransaction } = require("./pg.client");
const { DEFAULT_CONCURRENCY } = require('./constants');

class ImportAutomation {
	constructor(fileDir) {
		this.fileDir = fileDir
		this.filePaths = []
	}

	/**
	 * Init from param
	 *
	 * @static
	 * @param {string} fileDir - root file dir
	 * @returns {ImportAutomation}
	 */
	static fromFileDir(fileDir) {
		return new ImportAutomation(fileDir)
	}

	getFileDir() {
		return this.fileDir
	}


	/**
	 * Returns an array of loaded filepaths
	 *
	 * @returns {String[]} 
	 */
	getFilePaths() {
		return this.filePaths
	}

	/**
	 * Loads an array of filepaths, sets in the instance
	 */
	loadFileNames() {
		this.filePaths = FileManager.getChildrenWithAbsolutePath(this.getFileDir())
	}

	/**
	 * Processes xml files
	 *
	 * @async
	 * @returns {Promise<void>}
	 */
	async processFiles() {
		const startMs = performance.now()
		const files = this.getFilePaths()
		const concurrency = Number(process.env.CONCURRENCY) || DEFAULT_CONCURRENCY 
		logger.info('Running processing with concurrency %s', concurrency)

		if ( files.length === 0 ) {
			logger.info('No files found')
			return
		}

		const limit = pLimit(concurrency);
		await Promise.all(
			files.map((file, index) =>
				limit(async () => {
					try {
						logger.info('Processing %s file of %s', index + 1, files.length )
						await this.processOneFile(file, CompanyRepository)
					} catch(err) {
						logger.error('Eror %s', err.message)
					}
				})
			)
		);

		const timeElapsed = ( performance.now() - startMs) / 1000
		logger.info('Finished processing db insert in %s seconds', timeElapsed )
	}

	/**
	 * Processes one file and inserts records in the db
	 *
	 * @async
	 * @param {String} filePath - filepath
	 * @param {CompanyRepository} repository  - repository class, which has sql functions for insert
	 * @param {Number} [batchSize] - batch size, to control insert limits
	 * @returns {Promise<void>}
	 */
	async processOneFile(filePath, repository, batchSize = 1000) {
		let batch = [];
		const db = {withTransaction}

		const flush = async () => {
			if (batch.length === 0) return;
			const records = batch.map( item =>  new CompanyRecord(item))
			const inserted = await repository.insertBatch(db, records)
			//logger.info('File %s - inserted amount %s', filePath, inserted)
			batch = [];
		};

		await parseFile(filePath, async (record) => {
			batch.push(record);
			if (batch.length >= batchSize) {
				await flush();
			}
		});


		await flush();
	}
}

module.exports.ImportAutomation = ImportAutomation
