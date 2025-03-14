import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotes() {
  try {
    return await prisma.note.findMany();
  } catch (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
}

export async function createNote(title: string, content: string) {
  try {
    return await prisma.note.create({
      data: {
        title,
        content,
      },
    });
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function updateNote(id: number, title: string, content: string) {
  try {
    return await prisma.note.update({
      where: { id },
      data: { title, content },
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(id: number) {
  try {
    return await prisma.note.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}
