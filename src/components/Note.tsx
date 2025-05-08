import { useState, useEffect, useRef, useCallback } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import Editor from "./Editor";
import Chat from "./Chat";
import FloatingButton from "./FloatingButton";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoteProps {
  isMobile: boolean;
}

export default function Note({ isMobile }: NoteProps) {
  const { getActiveNote, updateNote } = useNotesStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [viewMode, setViewMode] = useState<"richtext" | "markdown">("richtext");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeNote = getActiveNote();

  // New state to track window width for responsive UI
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Determine if we're on a tablet-sized screen
  const isTablet = windowWidth >= 641 && windowWidth <= 1024;

  // Initialize the local state when the active note changes
  useEffect(() => {
    if (activeNote) {
      setContent(activeNote.content);
      setTitle(activeNote.title);
      setIsEdited(false);
      setSaveStatus("saved");
    }
  }, [activeNote?.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsEdited(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setIsEdited(true);
  };

  const handleSave = () => {
    if (activeNote) {
      updateNote(activeNote.id, { title, content });
      setIsEdited(false);
      setSaveStatus("saved");
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "richtext" ? "markdown" : "richtext");
  };

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Check if Ctrl key (or Command key on Mac) is pressed
      const ctrlPressed = e.ctrlKey || e.metaKey;

      if (ctrlPressed) {
        switch (e.key.toLowerCase()) {
          // Save - Ctrl+S
          case "s":
            e.preventDefault();
            if (isEdited && activeNote) {
              handleSave();
            }
            break;

          // Toggle Markdown - Ctrl+M
          case "m":
            e.preventDefault();
            toggleViewMode();
            break;

          // Toggle Chat - Ctrl+/
          case "/":
            e.preventDefault();
            toggleChat();
            break;

          default:
            break;
        }
      }
    },
    [isEdited, activeNote, toggleViewMode, toggleChat, handleSave]
  );

  // Add keyboard shortcut listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Autosave functionality
  useEffect(() => {
    if (isEdited && activeNote) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set saving status
      setSaveStatus("saving");

      // Set a new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 1000);
    }

    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, title, isEdited, activeNote]);

  // Function to extract plain text content from HTML for markdown conversion
  const getMarkdownContent = (htmlContent: string) => {
    // Very basic HTML to text conversion for markdown view
    // In a production app, you would use a proper HTML to Markdown converter
    return htmlContent
      .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
      .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
      .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
      .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
      .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
      .replace(/<em>(.*?)<\/em>/g, "*$1*")
      .replace(/<ul>(.*?)<\/ul>/g, (_, list) => {
        return list.replace(/<li>(.*?)<\/li>/g, "- $1\n");
      })
      .replace(/<ol>(.*?)<\/ol>/g, (_, list) => {
        let index = 0;
        return list.replace(/<li>(.*?)<\/li>/g, () => {
          index++;
          return `${index}. $1\n`;
        });
      })
      .replace(/<[^>]*>/g, ""); // Remove any remaining HTML tags
  };

  // Add a useEffect to detect clicks outside the chat on mobile
  useEffect(() => {
    if (isMobile && isChatOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        // Check if click was outside chat window and not on the chat button
        const chatWindow = document.querySelector(".chat-window");
        const chatBtn = document.querySelector(".chat-btn");

        if (
          chatWindow &&
          chatBtn &&
          !chatWindow.contains(e.target as Node) &&
          !chatBtn.contains(e.target as Node)
        ) {
          setIsChatOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMobile, isChatOpen]);

  if (!activeNote) {
    return (
      <div className="welcome-screen">
        <div className="welcome-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 className="welcome-title">Welcome to Notes</h2>
        <p className="welcome-desc">
          Create and manage your notes in a beautiful, distraction-free
          environment. Start by creating a new note or selecting an existing one
          from the sidebar.
        </p>
      </div>
    );
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <div className="content-area">
      <div className="content-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="document-title"
        />

        <div className="header-controls">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleViewMode}
            className="markdown-toggle-btn"
            title={
              viewMode === "richtext" ? "View as Markdown" : "Edit Rich Text"
            }
          >
            <span className="markdown-toggle-icon">
              {viewMode === "richtext" ? (
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              ) : (
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
            </span>
            <span className="markdown-toggle-text">
              {isTablet
                ? viewMode === "richtext"
                  ? "Markdown"
                  : "Edit"
                : viewMode === "richtext"
                ? "View as Markdown"
                : "Edit Rich Text"}
            </span>
          </motion.button>

          <div className="document-meta">
            <span className="document-meta-icon">
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
            </span>
            <span className="document-meta-text">
              Last edited {formatDate(activeNote.lastUpdated)}
            </span>
          </div>

          <motion.div
            animate={{
              opacity: saveStatus ? 1 : 0,
              y: saveStatus ? 0 : -10,
            }}
            transition={{ duration: 0.2 }}
            className="save-status"
          >
            {saveStatus === "saving" ? (
              <span className="text-amber-500 flex items-center text-xs">
                <svg
                  className="animate-spin -ml-1 mr-1 h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : saveStatus === "saved" ? (
              <span className="text-green-500 flex items-center text-xs">
                <svg
                  className="mr-1 h-3 w-3"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Saved
              </span>
            ) : null}
          </motion.div>

          <button
            className="theme-toggle-btn"
            aria-label="Toggle dark mode"
            onClick={() =>
              document.documentElement.classList.toggle("dark-mode")
            }
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
              className="sun-icon"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
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
              className="moon-icon"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="editor-container"
      >
        <div className="editor-content">
          {viewMode === "richtext" ? (
            <Editor
              content={content}
              onChange={handleContentChange}
              isMobile={isMobile}
            />
          ) : (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {getMarkdownContent(content)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </motion.div>

      <FloatingButton isOpen={isChatOpen} onClick={toggleChat} />

      <AnimatePresence>
        {isChatOpen && (
          <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
