import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/config/db'
import type { Note } from '@/lib/types'
import { ResultSetHeader } from 'mysql2'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Request method:', req.method)
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM notes')
      res.status(200).json(rows as Note[])
    } catch (error) {
      console.error('Error fetching notes:', error)
      res.status(500).json({ error: 'Error fetching notes' })
    }
  } else if (req.method === 'PUT') {
    const { id, title, content } = req.body
    if (!id || !title || !content) {
      console.error('Missing required fields:', { id, title, content })
      return res.status(400).json({ error: 'Missing required fields' })
    }
    try {
      const [result] = await pool.query<ResultSetHeader>('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id])
      if (result.affectedRows === 0) {
        console.error('Note not found:', { id })
        return res.status(404).json({ error: 'Note not found' })
      }
      res.status(200).json({ message: 'Note updated successfully' })
    } catch (error) {
      console.error('Error updating note:', error)
      res.status(500).json({ error: 'Error updating note' })
    }
  } else if (req.method === 'POST') {
    const { title, content } = req.body
    if (!title || !content) {
      console.error('Missing required fields:', { title, content })
      return res.status(400).json({ error: 'Missing required fields' })
    }
    try {
      const [result] = await pool.query<ResultSetHeader>('INSERT INTO notes (title, content) VALUES (?, ?)', [title, content])
      const newNoteId = result.insertId
      res.status(201).json({ id: newNoteId, message: 'Note created successfully' })
    } catch (error) {
      console.error('Error creating note:', error)
      res.status(500).json({ error: 'Error creating note' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
