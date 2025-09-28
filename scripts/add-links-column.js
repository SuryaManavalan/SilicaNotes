const mysql = require('mysql2/promise');
const fs = require('fs');

async function addLinksColumn() {
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
    
    // Check if links column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Note' AND COLUMN_NAME = 'links'
    `);
    
    if (columns.length > 0) {
      console.log('✅ Links column already exists in Note table');
      return;
    }
    
    console.log('⚡ Adding links column to Note table...');
    await connection.query('ALTER TABLE `Note` ADD COLUMN `links` JSON DEFAULT NULL');
    console.log('✅ Links column added successfully');
    
    console.log('\n🎉 Migration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

require('dotenv').config();
addLinksColumn();