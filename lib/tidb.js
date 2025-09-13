const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    rejectUnauthorized: true
  },
  connectionLimit: 10
});

const tidb = {
  async get(query, params) {
    const [rows] = await pool.execute(query, params);
    return rows[0] || null;
  },
  
  async all(query, params) {
    const [rows] = await pool.execute(query, params);
    return rows;
  },
  
  async run(query, params) {
    const [result] = await pool.execute(query, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  }
};

module.exports = tidb;