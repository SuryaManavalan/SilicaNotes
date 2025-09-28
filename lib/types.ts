export interface Note {
  id: string;
  title: string;
  content: string;
  links?: number[]; // Array of connected note IDs
  created_at: string;
  updated_at: string;
}

