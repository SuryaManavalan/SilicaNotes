const mysql = require('mysql2/promise');

async function addObsidianTestNotes() {
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
    
    // Test notes with Obsidian-style links
    const testNotes = [
      {
        title: 'Project Overview',
        content: `# Project Overview

This project involves [[JavaScript Fundamentals]] and [[React Components]].

We'll also need to understand [[Database Design|DB Design]] for the backend.

Key areas to focus on:
- [[API Development]]
- [[User Authentication]]
- [[Performance Optimization]]
`
      },
      {
        title: 'JavaScript Fundamentals',
        content: `# JavaScript Fundamentals

Core concepts include:
- Variables and functions
- Async/await patterns
- Event handling

This connects to [[React Components]] for UI development.
`
      },
      {
        title: 'React Components',
        content: `# React Components

Building blocks of React applications.

Related to [[JavaScript Fundamentals]] and [[API Development]].

See also: [[Performance Optimization]] for optimization tips.
`
      },
      {
        title: 'Database Design',
        content: `# Database Design

Planning the data structure for the application.

Works with [[API Development]] to serve data.
`
      },
      {
        title: 'API Development',
        content: `# API Development

Creating RESTful APIs for the application.

Connects [[Database Design]] with [[React Components]].
`
      }
    ];

    // Insert test notes
    for (const note of testNotes) {
      const [result] = await connection.query(
        'INSERT INTO `Note` (title, content, userId, createdAt, updatedAt) VALUES (?, ?, NULL, NOW(6), NOW(6))',
        [note.title, note.content]
      );
      console.log(`✅ Added note: "${note.title}" (ID: ${result.insertId})`);
    }
    
    console.log('\n🎉 Test notes with Obsidian links added successfully!');
    console.log('📝 These notes contain [[Note Title]] syntax that should be automatically linked when saved.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

require('dotenv').config();
addObsidianTestNotes();