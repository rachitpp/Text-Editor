import { useEffect, useCallback } from "react";
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  Editor as TiptapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isMobile?: boolean;
}

/**
 * Rich text editor component using TipTap
 * Supports headings, formatting, lists, and code blocks
 */
function Editor({ content, onChange, isMobile = false }: EditorProps) {
  // Content update callback - memoized to prevent unnecessary re-renders
  const handleUpdate = useCallback(
    ({ editor }: { editor: TiptapEditor }) => {
      onChange(editor.getHTML());
    },
    [onChange]
  );

  // Initialize TipTap editor with extensions
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // disable as we'll add our own
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "code-block",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
      Image,
      Typography,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-[300px]",
      },
    },
    onUpdate: handleUpdate,
  });

  // Update content when it changes from outside
  useEffect(() => {
    // Only update if editor exists and content has actually changed
    // This prevents unnecessary re-renders and edit history pollution
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Prevent default Tab behavior
      if (event.key === "Tab") {
        event.preventDefault();
        // Handle tab differently depending on context
        if (editor?.isActive("codeBlock")) {
          editor.commands.insertContent("\t");
        } else {
          editor?.commands.insertContent("&nbsp;&nbsp;&nbsp;&nbsp;");
        }
      }
    },
    [editor]
  );

  // Add link handler
  const addLink = useCallback(() => {
    if (!editor) return;

    // Ensure editor has focus
    if (!editor.isFocused) {
      editor.commands.focus();
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Add https if missing and needed
    const validUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;

    editor.chain().extendMarkRange("link").setLink({ href: validUrl }).run();
  }, [editor]);

  // Image upload handler
  const addImage = useCallback(() => {
    if (!editor) return;

    // Ensure editor has focus
    if (!editor.isFocused) {
      editor.commands.focus();
    }

    const url = window.prompt("Image URL");

    if (url) {
      editor
        .chain()
        .insertContent({
          type: "image",
          attrs: { src: url },
        })
        .run();
    }
  }, [editor]);

  // Loading state
  if (!editor) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-7 bg-gray-100 rounded w-1/4 mb-6"></div>
        <div className="h-4 bg-gray-100 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 mb-3"></div>
        <div className="h-4 bg-gray-100 rounded w-4/6 mb-3"></div>
      </div>
    );
  }

  // Helper function to create toolbar button
  const ToolbarButton = ({
    onClick,
    isActive,
    icon,
    label,
    className,
  }: {
    onClick: () => void;
    isActive: boolean;
    icon?: React.ReactNode;
    label?: string;
    className?: string;
  }) => (
    <button
      onClick={(e) => {
        e.preventDefault(); // Prevent default button behavior
        onClick();
      }}
      onMouseDown={(e) => e.preventDefault()} // Prevent editor from losing focus
      className={cn("toolbar-btn", isActive && "active", className)}
      aria-label={label}
      type="button" // Explicitly set button type
    >
      {icon || <span className="heading-label">{label}</span>}
    </button>
  );

  // Mobile optimized toolbar classes
  const toolbarClassName = isMobile
    ? "editor-toolbar mobile-toolbar"
    : "editor-toolbar";

  return (
    <div className="editor-wrapper">
      {/* Floating menu that appears when text is selected */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 150 }}
          className="bg-white rounded-lg overflow-hidden flex shadow-md border border-gray-200"
        >
          <div className="flex divide-x divide-gray-100">
            <div className="flex">
              <ToolbarButton
                onClick={() => {
                  if (!editor.isFocused) {
                    editor.commands.focus();
                  }
                  editor.chain().toggleHeading({ level: 1 }).run();
                }}
                isActive={editor.isActive("heading", { level: 1 })}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 17h14M5 12h14M5 7h14" />
                  </svg>
                }
                label="Heading 1"
              />
              <ToolbarButton
                onClick={() => {
                  if (!editor.isFocused) {
                    editor.commands.focus();
                  }
                  editor.chain().toggleBold().run();
                }}
                isActive={editor.isActive("bold")}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                  </svg>
                }
                label="Bold"
              />
              <ToolbarButton
                onClick={() => {
                  if (!editor.isFocused) {
                    editor.commands.focus();
                  }
                  editor.chain().toggleItalic().run();
                }}
                isActive={editor.isActive("italic")}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="4" x2="10" y2="4"></line>
                    <line x1="14" y1="20" x2="5" y2="20"></line>
                    <line x1="15" y1="4" x2="9" y2="20"></line>
                  </svg>
                }
                label="Italic"
              />
            </div>
          </div>
        </BubbleMenu>
      )}

      {/* Main toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={toolbarClassName}
      >
        <div className="flex items-center flex-wrap">
          {/* Heading buttons */}
          <div className="flex items-center">
            {[1, 2, 3].map((level) => (
              <ToolbarButton
                key={`h${level}`}
                onClick={() => {
                  // Ensure editor has focus before applying the command
                  if (!editor.isFocused) {
                    editor.commands.focus();
                  }
                  editor
                    .chain()
                    .toggleHeading({ level: level as 1 | 2 | 3 })
                    .run();
                }}
                isActive={editor.isActive("heading", { level })}
                label={`H${level}`}
                className="heading-btn"
              />
            ))}
          </div>

          <div className="toolbar-divider" />

          {/* Text formatting buttons */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleBold().run();
              }}
              isActive={editor.isActive("bold")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                </svg>
              }
              label="Bold"
            />
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleItalic().run();
              }}
              isActive={editor.isActive("italic")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="4" x2="10" y2="4"></line>
                  <line x1="14" y1="20" x2="5" y2="20"></line>
                  <line x1="15" y1="4" x2="9" y2="20"></line>
                </svg>
              }
              label="Italic"
            />
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleMark("underline").run();
              }}
              isActive={editor.isActive("underline")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
                  <line x1="4" y1="21" x2="20" y2="21"></line>
                </svg>
              }
              label="Underline"
            />
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleStrike().run();
              }}
              isActive={editor.isActive("strike")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <path d="M16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6"></path>
                  <path d="M8 18C8 20.2091 9.79086 22 12 22C14.2091 22 16 20.2091 16 18"></path>
                </svg>
              }
              label="Strikethrough"
            />
          </div>

          <div className="toolbar-divider" />

          {/* List buttons */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleBulletList().run();
              }}
              isActive={editor.isActive("bulletList")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              }
              label="Bullet List"
            />
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleOrderedList().run();
              }}
              isActive={editor.isActive("orderedList")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="10" y1="6" x2="21" y2="6" />
                  <line x1="10" y1="12" x2="21" y2="12" />
                  <line x1="10" y1="18" x2="21" y2="18" />
                  <path d="M4 6h1v4" />
                  <path d="M4 10h2" />
                  <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                </svg>
              }
              label="Ordered List"
            />
          </div>

          <div className="toolbar-divider" />

          {/* Code block button */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                editor.chain().toggleCode().run();
              }}
              isActive={editor.isActive("code")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              }
              label="Code"
            />
          </div>

          <div className="toolbar-divider" />

          {/* Link and Image buttons */}
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                addLink();
              }}
              isActive={editor.isActive("link")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              }
              label="Add Link"
            />
            <ToolbarButton
              onClick={() => {
                if (!editor.isFocused) {
                  editor.commands.focus();
                }
                addImage();
              }}
              isActive={false}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              }
              label="Add Image"
            />
          </div>

          {/* Share/Link button - removed as requested */}
          {/* 
          <div className="toolbar-divider" />
          
          <ToolbarButton
            onClick={() => {
              const url = prompt('Enter link URL');
              if (url) {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive('link')}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            }
            label="Add Link"
          />
          */}
        </div>
      </motion.div>

      {/* Editor content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="prose max-w-none"
      >
        <EditorContent editor={editor} onKeyDown={handleKeyDown} />
      </motion.div>
    </div>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export default Editor;
