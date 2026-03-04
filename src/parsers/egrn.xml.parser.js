const sax = require('sax');
const FileManager = require('../utils/class.file.manager');
const { logger } = require('../utils/logger');
const { DOCUMENT_TAG, DOC_ID_ATTR, DATE_CREATED_ATTR, DATE_INCLUDED_ATTR, KIND_ATTR, CATEGORY_ATTR, IP_ATTR, IP_INN_ATTR, IP_ORGNIP_ATTR, IP_CREDS_ATTR, IP_LASTNAME_ATTR, IP_FIRSTNAME_ATTR, IP_MIDDLENAME_ATTR, REGION_PARENT_ATTR, REGION_ATTR, OKVED_MAIN_ATTR, OKVED_MAIN_CODE_ATTR, OKVED_MAIN_NAME_ATTR, OKVED_MAIN_VERSION_ATTR } = require('../utils/constants');

/**
 * Record parser (Файл -> Документ -> ...).
 * On each </Документ> calls onRecord(record).
 *
 * @param {string} filePath
 * @param {(record: object) => (void|Promise<void>)} onRecord
 * @param {{ limit?: number }} [opts]
 */
async function parseFile(filePath, onRecord, opts = {}) {
  const limit = Number.isFinite(opts.limit) ? opts.limit : Infinity;

  const parser = sax.createStream(true, { trim: true, normalize: true });
  const input = FileManager.getFileAsStream(filePath);

  let inDoc = false;
  let doc = null;
  let count = 0;

  let currentTag = null;

  parser.on('opentag', (node) => {
    const name = node.name;
    const attrs = node.attributes;

    if (name === DOCUMENT_TAG) {
      inDoc = true;
      doc = {
				isIp: false,
        idDoc: attrs[DOC_ID_ATTR] ?? null,
        dateCreated: attrs[DATE_CREATED_ATTR] ?? null,
        dateIncluded: attrs[DATE_INCLUDED_ATTR] ?? null,
        kind: attrs[KIND_ATTR] ?? null,
        category: attrs[CATEGORY_ATTR] ?? null,

        inn: null,
        ogrnip: null,
        lastName: null,
        firstName: null,
        middleName: null,

        regionCode: null,

        okvedMainCode: null,
        okvedMainName: null,
        okvedVersion: null,
      };
      return;
    }

    if (!inDoc) return;

    if (name === IP_ATTR) {
      doc.inn = attrs[IP_INN_ATTR] ?? doc.inn;
			doc.isIp = true;
      doc.ogrnip = attrs[IP_ORGNIP_ATTR] ?? doc.ogrnip;
      currentTag = IP_ATTR;
      return;
    }

    if (name === IP_CREDS_ATTR) {
      doc.lastName = attrs[IP_LASTNAME_ATTR] ?? doc.lastName;
      doc.firstName = attrs[IP_FIRSTNAME_ATTR] ?? doc.firstName;
      doc.middleName = attrs[IP_MIDDLENAME_ATTR] ?? doc.middleName;
      currentTag = IP_CREDS_ATTR;
      return;
    }

    if (name === REGION_PARENT_ATTR) {
      doc.regionCode = attrs[REGION_ATTR] ?? doc.regionCode;
      currentTag = REGION_PARENT_ATTR;
      return;
    }

    if (name === OKVED_MAIN_ATTR) {
      doc.okvedMainCode = attrs[OKVED_MAIN_CODE_ATTR] ?? doc.okvedMainCode;
      doc.okvedMainName = attrs[OKVED_MAIN_NAME_ATTR] ?? doc.okvedMainName;
      doc.okvedVersion = attrs[OKVED_MAIN_VERSION_ATTR] ?? doc.okvedVersion;
      currentTag = OKVED_MAIN_ATTR;
      return;
    }

    currentTag = name;
  });

  parser.on('closetag', async (name) => {
    if (name === DOCUMENT_TAG && inDoc) {
      count += 1;

			//$TODO
			// skip orgs for now
			if ( doc.isIp ) {
				await onRecord(doc);
			}

      inDoc = false;
      doc = null;

      if (count >= limit) {
        input.destroy();
      }
      return;
    }

    if (currentTag === name) currentTag = null;
  });

  return new Promise((resolve, reject) => {
    parser.on('error', (err) => reject(err));
    input.on('error', (err) => reject(err));
    input.on('end', () => {
			logger.info('Ended parsing file %s', filePath)
			resolve({ processed: count })
		})
    input.pipe(parser);
  });
}

module.exports.parseFile = parseFile;
