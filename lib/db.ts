// Re-export database functions from the centralized database module
export {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  prisma,
} from './database'
