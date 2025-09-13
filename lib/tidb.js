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

// Initialize tables
async function initTables() {
  const connection = await pool.getConnection();
  
  try {
    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tenants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        slug VARCHAR(50) UNIQUE,
        name VARCHAR(100),
        plan VARCHAR(20) DEFAULT 'free'
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(20),
        tenant_id INT,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      )
    `);
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255),
        content TEXT,
        tenant_id INT,
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Insert test data if not exists
    const [tenants] = await connection.execute('SELECT COUNT(*) as count FROM tenants');
    if (tenants[0].count === 0) {
      await connection.execute("INSERT INTO tenants (slug, name, plan) VALUES ('acme', 'Acme Corp', 'free')");
      await connection.execute("INSERT INTO tenants (slug, name, plan) VALUES ('globex', 'Globex Inc', 'free')");
      
      await connection.execute("INSERT INTO users (email, password, role, tenant_id) VALUES ('admin@acme.test', 'password', 'admin', 1)");
      await connection.execute("INSERT INTO users (email, password, role, tenant_id) VALUES ('user@acme.test', 'password', 'member', 1)");
      await connection.execute("INSERT INTO users (email, password, role, tenant_id) VALUES ('admin@globex.test', 'password', 'admin', 2)");
      await connection.execute("INSERT INTO users (email, password, role, tenant_id) VALUES ('user@globex.test', 'password', 'member', 2)");
    }
  } finally {
    connection.release();
  }
}

module.exports = { pool, initTables };