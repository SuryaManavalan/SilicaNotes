import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { addNoteLink, removeNoteLink } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const userId = session?.user?.id

  if (req.method === 'POST') {
    // Add a link between two notes
    const { noteId, linkedNoteId } = req.body
    
    if (!noteId || !linkedNoteId) {
      return res.status(400).json({ error: 'Missing required fields: noteId, linkedNoteId' })
    }

    try {
      const updatedNote = await addNoteLink(parseInt(noteId), parseInt(linkedNoteId), userId)
      res.status(200).json({ success: true, note: updatedNote })
    } catch (error) {
      console.error('Error adding note link:', error)
      res.status(500).json({ error: 'Failed to add note link' })
    }
  } else if (req.method === 'DELETE') {
    // Remove a link between two notes
    const { noteId, linkedNoteId } = req.body
    
    if (!noteId || !linkedNoteId) {
      return res.status(400).json({ error: 'Missing required fields: noteId, linkedNoteId' })
    }

    try {
      const updatedNote = await removeNoteLink(parseInt(noteId), parseInt(linkedNoteId), userId)
      res.status(200).json({ success: true, note: updatedNote })
    } catch (error) {
      console.error('Error removing note link:', error)
      res.status(500).json({ error: 'Failed to remove note link' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}