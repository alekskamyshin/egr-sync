class CompanyRecord {
	constructor({
		idDoc,
		dateCreated,
		dateIncluded,
		kind,
		category,

		// IP fields
		inn,
		ogrnip,
		lastName,
		firstName,
		middleName,

		// Location
		regionCode,

		// OKVED
		okvedMainCode,
		okvedMainName,
		okvedVersion,

		// Audit
		sourceFile,
	}) {
		this.idDoc = idDoc ?? null;
		this.dateCreated = dateCreated ?? null;
		this.dateIncluded = dateIncluded ?? null;
		this.kind = kind ?? null;
		this.category = category ?? null;

		this.inn = inn ?? null;
		this.ogrnip = ogrnip ?? null;
		this.lastName = lastName ?? null;
		this.firstName = firstName ?? null;
		this.middleName = middleName ?? null;

		this.regionCode = regionCode ?? null;

		this.okvedMainCode = okvedMainCode ?? null;
		this.okvedMainName = okvedMainName ?? null;
		this.okvedVersion = okvedVersion ?? null;

		this.sourceFile = sourceFile ?? null;
	}

	/**
	 * Converts record to ordered DB row
	 * Must match SQL column order
	 */
	toRow() {
		return [
			this.idDoc,
			this.normalizeDate(this.dateCreated),
			this.normalizeDate(this.dateIncluded),
			this.kind,
			this.category,

			this.inn,
			this.ogrnip,
			this.lastName,
			this.firstName,
			this.middleName,

			this.regionCode,

			this.okvedMainCode,
			this.okvedMainName,
			this.okvedVersion,

			this.sourceFile,
		];
	}

	normalizeDate(value) {
		if (!value) return null;

		// XML date format example: 10.02.2026
		const [day, month, year] = value.split('.');
		return `${year}-${month}-${day}`;
	}
}

module.exports.CompanyRecord = CompanyRecord
