import { useState, useEffect, useRef } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import { AnimatePresence, motion } from "framer-motion";

interface SidebarProps {
  isMobile: boolean;
  closeSidebar: () => void;
}

export default function Sidebar({ isMobile, closeSidebar }: SidebarProps) {
  const { notes, activeNoteId, addNote, setActiveNote, deleteNote } =
    useNotesStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const newNoteTitleRef = useRef<HTMLInputElement>(null);

  // Focus the title input when adding a new note
  useEffect(() => {
    if (isAddingNote && newNoteTitleRef.current) {
      newNoteTitleRef.current.focus();
    }
  }, [isAddingNote]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  // Filter notes based on search term
  const filteredNotes =
    searchTerm.trim() === ""
      ? notes
      : notes.filter(
          (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

  // Extract a preview text from HTML content
  const getPreviewText = (htmlContent: string) => {
    // Simple strip tags approach
    const textOnly = htmlContent.replace(/<[^>]*>/g, " ");
    return textOnly.substring(0, 100).trim();
  };

  // Handle note deletion with confirmation
  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent triggering the note selection
    if (window.confirm("Are you sure you want to delete this note?")) {
      deleteNote(noteId);

      // Close sidebar on mobile after deleting
      if (isMobile) {
        closeSidebar();
      }
    }
  };

  const handleCreateNote = () => {
    setIsAddingNote(true);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newNoteTitle.trim() || "Untitled Note";
    const newNoteId = addNote(title);
    setActiveNote(newNoteId);
    setNewNoteTitle("");
    setIsAddingNote(false);

    // Close sidebar on mobile after creating a note
    if (isMobile) {
      closeSidebar();
    }
  };

  const cancelAddNote = () => {
    setIsAddingNote(false);
    setNewNoteTitle("");
  };

  const handleNoteSelect = (noteId: string) => {
    setActiveNote(noteId);

    // Close sidebar on mobile when a note is selected
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <>
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Notes
        </h1>
      </div>

      <div className="search-container">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="search-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="note-actions-container">
        {isAddingNote ? (
          <div className="add-note-container">
            <form onSubmit={handleAddNoteSubmit} className="add-note-form">
              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Enter note title..."
                className="add-note-input"
                ref={newNoteTitleRef}
                autoFocus
                maxLength={50}
              />
              <div className="add-note-actions">
                <button type="submit" className="add-note-submit">
                  Create
                </button>
                <button
                  type="button"
                  onClick={cancelAddNote}
                  className="add-note-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button onClick={handleCreateNote} className="new-note-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Note
          </button>
        )}
      </div>

      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-notes-container">
            {searchTerm ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="empty-notes-icon"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <p className="empty-notes-title">No matches found</p>
                <p className="empty-notes-desc">Try a different search term</p>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="empty-notes-icon"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p className="empty-notes-title">No notes yet</p>
                <p className="empty-notes-desc">
                  Create your first note to get started
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className={`note-card ${
                  activeNoteId === note.id ? "active" : ""
                }`}
                onClick={() => handleNoteSelect(note.id)}
              >
                <div className="flex justify-between w-full">
                  <h3 className="note-title">
                    {note.title || "Untitled Note"}
                  </h3>
                  <button
                    className="delete-note-btn"
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    aria-label="Delete note"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                  </button>
                </div>
                {note.content && (
                  <p className="note-preview">{getPreviewText(note.content)}</p>
                )}
                <div className="note-meta">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{formatDate(note.lastUpdated)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </>
  );
}
