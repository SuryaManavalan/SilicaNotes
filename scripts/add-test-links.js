const mysql = require('mysql2/promise');

async function addTestLinks() {
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
    
    // Get all notes
    const [notes] = await connection.query('SELECT id, title FROM `Note` ORDER BY id');
    console.log(`Found ${notes.length} notes`);
    
    if (notes.length < 2) {
      console.log('⚠️ Need at least 2 notes to create links');
      return;
    }
    
    // Add some test links between first few notes
    const testLinks = [
      { noteId: notes[0].id, links: [notes[1].id, notes[2]?.id].filter(Boolean) },
      { noteId: notes[1].id, links: [notes[0].id, notes[3]?.id].filter(Boolean) },
    ];
    
    for (const { noteId, links } of testLinks) {
      if (links.length > 0) {
        await connection.query(
          'UPDATE `Note` SET links = ? WHERE id = ?',
          [JSON.stringify(links), noteId]
        );
        console.log(`✅ Added links to note ${noteId}:`, links);
      }
    }
    
    console.log('\n🎉 Test links added successfully!');
    console.log('🎯 Now when you view the graph, it should use these database connections instead of random ones');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

require('dotenv').config();
addTestLinks();