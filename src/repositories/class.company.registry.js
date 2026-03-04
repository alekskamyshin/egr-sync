const { CompanyRecord } = require('../records/class.company.record');

class CompanyRepository {

	/**
	* Inserts records
	* @static
	* @param {{ withTransaction: (fn: Function) => Promise<any> }} db
	* @param {CompanyRecord[]} records
	* @returns {Promise<number>} number of processed rows (attempted)
	*/
	static async insertBatch(db, records) {
		if (!records || records.length === 0) return 0;

		// Column order MUST match CompanyRecord#toRow()
		const columns = [
			'doc_id',
			'date_created',
			'date_included',
			'subject_kind',
			'subject_category',
			'inn',
			'ogrnip',
			'last_name',
			'first_name',
			'middle_name',
			'region_code',
			'okved_main_code',
			'okved_main_name',
			'okved_version',
			'source_file',
		];

		const rows = records.map((r) => r.toRow());
		const colCount = columns.length;

		// Flatten values: [[...],[...]] -> [...]
		const values = new Array(rows.length * colCount);
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			if (!Array.isArray(row) || row.length !== colCount) {
				throw new Error(
					`Invalid row shape at index ${i}: expected ${colCount} values, got ${Array.isArray(row) ? row.length : typeof row}`
				);
			}
			for (let j = 0; j < colCount; j++) {
				values[i * colCount + j] = row[j];
			}
		}

		let p = 1;
		const valuesSql = rows
		.map(() => {
			const group = new Array(colCount);
			for (let j = 0; j < colCount; j++) group[j] = `$${p++}`;
			return `(${group.join(',')})`;
		})
		.join(',');

		const setSql = columns
		.filter((c) => c !== 'doc_id') 
		.map((c) => `${c}=EXCLUDED.${c}`)
		.join(', ');

		const sql = `
			INSERT INTO company_registry (${columns.join(',')})
			VALUES ${valuesSql}
			ON CONFLICT (doc_id) DO UPDATE
			SET ${setSql};
			`;

		await db.withTransaction(async (client) => {
			await client.query(sql, values);
		});

		return records.length;
	}

}

module.exports.CompanyRepository = CompanyRepository
