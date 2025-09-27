// Test script to verify user-specific note loading
import { getNotes, createNote } from '../lib/database'

async function testUserNotes() {
  try {
    console.log('Testing user-specific note loading...')
    
    // Test 1: Create a public note (no userId)
    console.log('\n1. Creating public note...')
    const publicNote = await createNote('Public Note', 'This is accessible to everyone')
    console.log('✅ Created public note:', { id: publicNote.id, title: publicNote.title, userId: publicNote.userId })
    
    // Test 2: Create a user-specific note
    console.log('\n2. Creating user-specific note...')
    const userNote = await createNote('User Note', 'This belongs to user123', 'user123')
    console.log('✅ Created user note:', { id: userNote.id, title: userNote.title, userId: userNote.userId })
    
    // Test 3: Get notes when not authenticated (should only see public notes)
    console.log('\n3. Getting notes without authentication...')
    const publicNotes = await getNotes()
    console.log('✅ Public notes:', publicNotes.map(n => ({ id: n.id, title: n.title, userId: n.userId })))
    
    // Test 4: Get notes when authenticated as user123 (should see user's notes + public notes)
    console.log('\n4. Getting notes as user123...')
    const userNotes = await getNotes('user123')
    console.log('✅ User123 notes:', userNotes.map(n => ({ id: n.id, title: n.title, userId: n.userId })))
    
    // Test 5: Get notes when authenticated as different user (should only see public notes)
    console.log('\n5. Getting notes as user456...')
    const otherUserNotes = await getNotes('user456')
    console.log('✅ User456 notes:', otherUserNotes.map(n => ({ id: n.id, title: n.title, userId: n.userId })))
    
    console.log('\n🎉 User-specific note loading test complete!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

if (require.main === module) {
  testUserNotes()
}

export default testUserNotes