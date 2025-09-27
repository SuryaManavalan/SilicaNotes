import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Note-related database operations
export async function getNotes(userId?: string) {
  try {
    if (userId) {
      // When authenticated: get user's notes + any notes with null userId (shared/public notes)
      return await prisma.note.findMany({
        where: {
          OR: [
            { userId: userId },
            { userId: null }
          ]
        },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      // When not authenticated: only get notes with null userId
      return await prisma.note.findMany({
        where: { userId: null },
        orderBy: { updatedAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
}

export async function createNote(title: string, content: string, userId?: string) {
  try {
    return await prisma.note.create({
      data: {
        title,
        content,
        userId, // Will be null if not provided (for unauthenticated users)
      },
    });
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function updateNote(id: number, title: string, content: string, userId?: string) {
  try {
    // First check if the note exists and user has permission to edit it
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { userId: userId }, // User owns the note
          { userId: null },   // Public note (can be edited by anyone)
        ]
      }
    });

    if (!existingNote) {
      throw new Error('Note not found or no permission to edit');
    }

    return await prisma.note.update({
      where: { id },
      data: { 
        title, 
        content,
        // If updating a null userId note and user is authenticated, assign it to them
        ...(existingNote.userId === null && userId && { userId })
      },
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(id: number, userId?: string) {
  try {
    // First check if the note exists and user has permission to delete it
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        OR: [
          { userId: userId }, // User owns the note
          { userId: null },   // Public note (can be deleted by anyone)
        ]
      }
    });

    if (!existingNote) {
      throw new Error('Note not found or no permission to delete');
    }

    return await prisma.note.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}