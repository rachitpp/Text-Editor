import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

// Message type for chat
export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: number;
}

// Note type
export interface Note {
  id: string;
  title: string;
  content: string;
  chatHistory: Message[];
  lastUpdated: number;
}

// Store type
interface NotesState {
  notes: Note[];
  activeNoteId: string | null;
}

interface NotesActions {
  // Actions
  addNote: (title?: string) => string;
  updateNote: (id: string, data: Partial<Omit<Note, "id">>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string) => void;
  addMessage: (
    noteId: string,
    message: Omit<Message, "id" | "timestamp">
  ) => void;
}

// Selectors for derived state
interface NotesSelectors {
  getActiveNote: () => Note | null;
  getNoteById: (id: string) => Note | undefined;
  getFilteredNotes: (searchTerm: string) => Note[];
  getTotalNoteCount: () => number;
}

// Complete store type
type NotesStore = NotesState & NotesActions & NotesSelectors;

// Generate a unique ID
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Create initial notes
const createDefaultNotes = (): Note[] => [
  {
    id: generateId(),
    title: "Welcome to Notes Editor",
    content:
      "<h1>Welcome to the Notes Editor</h1><p>This is your first note. You can edit it or create a new one.</p><ul><li>Click the edit button to start editing</li><li>Use the AI button to chat with AI</li></ul>",
    chatHistory: [],
    lastUpdated: Date.now(),
  },
  {
    id: generateId(),
    title: "Getting Started with TipTap",
    content:
      "<h1>TipTap Editor</h1><p>This editor supports rich text formatting:</p><h2>Headings</h2><h3>Subheadings</h3><ul><li>Bullet lists</li><li>With multiple items</li></ul><ol><li>Numbered lists</li><li>Work too!</li></ol>",
    chatHistory: [],
    lastUpdated: Date.now() - 1000 * 60 * 5, // 5 minutes ago
  },
];

// Create store with persistence and immer for immutable updates
export const useNotesStore = create<NotesStore>()(
  persist(
    immer((set, get) => ({
      // State
      notes: createDefaultNotes(),
      activeNoteId: createDefaultNotes()[0].id,

      // Selectors (memoized for performance)
      getActiveNote: () => {
        const { notes, activeNoteId } = get();
        return notes.find((note) => note.id === activeNoteId) || null;
      },

      getNoteById: (id: string) => {
        return get().notes.find((note) => note.id === id);
      },

      getFilteredNotes: (searchTerm: string) => {
        const { notes } = get();
        if (!searchTerm.trim()) return notes;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return notes.filter(
          (note: Note) =>
            note.title.toLowerCase().includes(lowerCaseSearchTerm) ||
            // Remove HTML tags before searching content
            note.content
              .replace(/<[^>]*>/g, "")
              .toLowerCase()
              .includes(lowerCaseSearchTerm)
        );
      },

      getTotalNoteCount: () => {
        return get().notes.length;
      },

      // Actions
      addNote: (title?: string) => {
        const newNote: Note = {
          id: generateId(),
          title: title || "Untitled Note",
          content: "<p></p>",
          chatHistory: [],
          lastUpdated: Date.now(),
        };

        set((state) => {
          state.notes.push(newNote);
          state.activeNoteId = newNote.id;
        });

        return newNote.id;
      },

      // Update note data
      updateNote: (id, data) => {
        set((state) => {
          const noteIndex = state.notes.findIndex(
            (note: Note) => note.id === id
          );
          if (noteIndex !== -1) {
            const note = state.notes[noteIndex];
            // Only update if data has actually changed
            if (
              (data.title && data.title !== note.title) ||
              (data.content && data.content !== note.content) ||
              data.chatHistory
            ) {
              state.notes[noteIndex] = {
                ...note,
                ...data,
                lastUpdated: Date.now(),
              };
            }
          }
        });
      },

      // Delete a note
      deleteNote: (id) => {
        const { activeNoteId } = get();

        set((state) => {
          state.notes = state.notes.filter((note: Note) => note.id !== id);

          // If we deleted the active note, set a new active note
          if (activeNoteId === id && state.notes.length > 0) {
            state.activeNoteId = state.notes[0].id;
          } else if (state.notes.length === 0) {
            state.activeNoteId = null;
          }
        });
      },

      // Set the active note
      setActiveNote: (id) => {
        set((state) => {
          state.activeNoteId = id;
        });
      },

      // Add a message to a note's chat history
      addMessage: (noteId, message) => {
        const newMessage: Message = {
          id: generateId(),
          content: message.content,
          sender: message.sender,
          timestamp: Date.now(),
        };

        set((state) => {
          const noteIndex = state.notes.findIndex(
            (note: Note) => note.id === noteId
          );
          if (noteIndex !== -1) {
            state.notes[noteIndex].chatHistory.push(newMessage);
            state.notes[noteIndex].lastUpdated = Date.now();
          }
        });
      },
    })),
    {
      name: "notes-storage", // Name for localStorage
      partialize: (state) => ({
        notes: state.notes,
        activeNoteId: state.activeNoteId,
      }),
    }
  )
);
