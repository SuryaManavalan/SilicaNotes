const mysql = require('mysql2/promise');

async function removeAllLinks() {
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
    
    // Get all notes that have links
    const [notesWithLinks] = await connection.query('SELECT id, title, links FROM `Note` WHERE links IS NOT NULL');
    console.log(`Found ${notesWithLinks.length} notes with links`);
    
    if (notesWithLinks.length === 0) {
      console.log('✅ No links found to remove');
      return;
    }
    
    // Show current links before removing
    notesWithLinks.forEach(note => {
      try {
        const links = JSON.parse(note.links || '[]');
        console.log(`📝 Note ${note.id} "${note.title}" has links:`, links);
      } catch (error) {
        console.log(`📝 Note ${note.id} "${note.title}" has invalid JSON links:`, note.links);
      }
    });
    
    // Remove all links by setting them to NULL
    const [result] = await connection.query('UPDATE `Note` SET links = NULL WHERE links IS NOT NULL');
    
    console.log(`\n✅ Removed links from ${result.affectedRows} notes`);
    console.log('🎯 All notes now have clean link state - ready for your specific linking approach');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

require('dotenv').config();
removeAllLinks();