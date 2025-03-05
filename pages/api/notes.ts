import type { NextApiRequest, NextApiResponse } from 'next'
import pool from '@/config/db'
import type { Note } from '@/lib/types'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('req.method')
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM notes')
      res.status(200).json(rows as Note[])
    } catch (error) {
      res.status(500).json({ error: error })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
