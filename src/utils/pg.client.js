require('dotenv').config();
const { Pool } = require('pg');
const { logger } = require('./logger');

const pool = new Pool({
  user: process.env.PG_USERNAME,
  host: process.env.PG_HOST,
  database: process.env.PG_DBNAME,
  password: process.env.PG_PASSWORD,
  port: Number(process.env.PG_PORT),
});


const withTransaction = async (fn) => {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')
		const result = await fn(client)
		await client.query('COMMIT')
		return result
	} catch(e) {
		logger.error('ERROR %s', e.message)
		await client.query('ROLLBACK')
		throw(e)
	} finally {
		client.release()
	}
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
	withTransaction,
  close: () => pool.end(),
};
