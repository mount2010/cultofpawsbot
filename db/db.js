const mysql = require("mysql2/promise");
const config = require(`${process.cwd()}/config/config.json`);
const secrets = require(`${process.cwd()}/config/secrets.json`);

const pool = mysql.createPool({
	connectionLimit: config.db.connectionLimit,
	host: config.db.ip,
	database: config.db.db,
	user: secrets.db.user,
	password: secrets.db.password
});

async function getPoolConnection() {
	return await pool.getConnection();
}

module.exports = { getPoolConnection };
