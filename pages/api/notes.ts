import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the user session
  const session = await getServerSession(req, res, authOptions)
  const userId = session?.user?.id

  if (req.method === 'GET') {
    try {
      const notes = await getNotes(userId)
      
      // Transform the notes to match your existing Note interface
      const transformedNotes = notes.map(note => ({
        id: note.id.toString(),
        title: note.title,
        content: note.content || '',
        created_at: note.createdAt.toISOString(),
        updated_at: note.updatedAt.toISOString(),
      }))
      
      res.status(200).json(transformedNotes)
    } catch (error) {
      console.error('Error fetching notes:', error)
      res.status(500).json({ error: 'Error fetching notes' })
    }
  } else if (req.method === 'PUT') {
    const { id, title, content } = req.body
    if (!id || title === undefined || content === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    try {
      const updatedNote = await updateNote(parseInt(id), title, content, userId)
      
      const transformedNote = {
        id: updatedNote.id.toString(),
        title: updatedNote.title,
        content: updatedNote.content || '',
        created_at: updatedNote.createdAt.toISOString(),
        updated_at: updatedNote.updatedAt.toISOString(),
      }
      
      res.status(200).json(transformedNote)
    } catch (error) {
      console.error('Error updating note:', error)
      res.status(500).json({ error: 'Error updating note' })
    }
  } else if (req.method === 'POST') {
    const { title, content } = req.body
    if (title === undefined || content === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    try {
      const newNote = await createNote(title, content, userId)
      
      const transformedNote = {
        id: newNote.id.toString(),
        title: newNote.title,
        content: newNote.content || '',
        created_at: newNote.createdAt.toISOString(),
        updated_at: newNote.updatedAt.toISOString(),
      }
      
      res.status(201).json(transformedNote)
    } catch (error) {
      console.error('Error creating note:', error)
      res.status(500).json({ error: 'Error creating note' })
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' })
    }
    try {
      await deleteNote(parseInt(id), userId)
      res.status(200).json({ message: 'Note deleted successfully' })
    } catch (error) {
      console.error('Error deleting note:', error)
      res.status(500).json({ error: 'Error deleting note' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
