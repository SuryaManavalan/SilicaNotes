import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/config/db'
import type { Note } from '@/lib/types'
import { ResultSetHeader } from 'mysql2'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('req.method')
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM notes')
      res.status(200).json(rows as Note[])
    } catch (error) {
      res.status(500).json({ error: error })
    }
  } else if (req.method === 'PUT') {
    const { id, title, content } = req.body
    if (!id || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    try {
      const [result] = await pool.query<ResultSetHeader>('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, id])
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Note not found' })
      }
      res.status(200).json({ message: 'Note updated successfully' })
    } catch (error) {
      res.status(500).json({ error: error })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
