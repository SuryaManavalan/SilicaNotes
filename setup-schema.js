const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupSchema() {
  const dbUrl = process.env.DATABASE_URL;
  const url = new URL(dbUrl);
  
  const connection = await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connected to SingleStore database');
    
    const sql = fs.readFileSync('./setup-schema.sql', 'utf8');
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (trimmed) {
        try {
          console.log('⚡ Executing:', trimmed.substring(0, 50) + '...');
          await connection.query(trimmed);
          console.log('✅ Success');
        } catch (error) {
          console.log('⚠️ Warning:', error.message.substring(0, 100));
        }
      }
    }
    
    console.log('\n🎉 Schema setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

require('dotenv').config();
setupSchema();