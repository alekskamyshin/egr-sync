const fs = require('fs');
const path = require('path');

class FileManager {

	/**
 * Lists children (files or directories) of a given parent folder.
 * @param {string} parentPath - Absolute or relative path of the parent directory.
 * @param {Object} options - Filtering options.
 * @param {boolean} [options.onlyDirectories=false] - If true, only directories will be returned.
 * @param {boolean} [options.onlyFiles=false] - If true, only files will be returned.
 * @returns {string[]} - List of absolute child paths.
 */
	static getChildrenWithAbsolutePath(parentPath, options = {}) {
		const absoluteParentPath = path.resolve(parentPath);

		if (!fs.existsSync(absoluteParentPath)) {
			throw new Error(`Parent folder does not exist: ${absoluteParentPath}`);
		}

		return fs.readdirSync(absoluteParentPath)
			.map(child => path.join(absoluteParentPath, child))
			.filter(childPath => {
				const isDirectory = fs.statSync(childPath).isDirectory();

				if (options.onlyDirectories) return isDirectory;
				if (options.onlyFiles) return !isDirectory;
				return true;
			});
	}

	/**
	 * Returns  read stream
	 *
	 * @static
	 * @param {String} filePath 
	 * @param {String} [encoding] - utf8 by default
	 * @returns {fs.ReadStream} file readableStream
	 */
	static getFileAsStream(filePath, encoding = 'utf8') {
		return fs.createReadStream(filePath, {encoding})
	}
}

module.exports = FileManager;
