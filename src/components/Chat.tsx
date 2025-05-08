import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  content: string;
  role: "user" | "bot";
  timestamp: number;
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample note-related topics for the AI to understand - used for topic categorization
const NOTE_TOPICS = [
  "formatting",
  "headings",
  "bold",
  "italic",
  "lists",
  "bullet points",
  "markdown",
  "save",
  "autosave",
  "keyboard shortcuts",
  "dark mode",
  "images",
  "links",
  "organize",
  "delete",
];

// Writing tips the AI can suggest
const WRITING_TIPS = [
  "Use headings to create a clear structure in your notes",
  "Break down complex ideas into bullet points for easier comprehension",
  "Highlight key concepts or terms using bold or italic formatting",
  "Use numbered lists for step-by-step processes or sequences",
  "Keep paragraphs short and focused on a single idea",
  "Add links to external resources for deeper research",
  "Use consistent formatting for similar types of information",
  "Include images or diagrams to visualize complex concepts",
  "Use markdown for code snippets or technical content",
  "Review and reorganize your notes periodically for better clarity",
];

// Study and productivity techniques
const PRODUCTIVITY_TECHNIQUES = [
  {
    name: "Pomodoro Technique",
    description:
      "Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.",
  },
  {
    name: "Cornell Note-Taking Method",
    description:
      "Divide your page into sections: notes, cues, and summary. Take notes during class, add cues later, and write a summary at the bottom.",
  },
  {
    name: "Mind Mapping",
    description:
      "Create visual diagrams to connect related concepts. Start with a central idea and branch out with related thoughts.",
  },
  {
    name: "Spaced Repetition",
    description:
      "Review material at increasing intervals to enhance long-term retention.",
  },
  {
    name: "Feynman Technique",
    description:
      "Explain a concept in simple terms as if teaching it to someone else. This helps identify gaps in your understanding.",
  },
];

export default function Chat({ isOpen, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello! I'm your AI assistant. How can I help with your notes today?",
      role: "bot",
      timestamp: Date.now(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [conversationContext, setConversationContext] = useState<string[]>([]);

  // Focus on input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update conversation context when new messages are added
  useEffect(() => {
    if (messages.length > 1) {
      // Keep only the last 5 messages for context
      const recentMessages = messages.slice(-5).map((msg) => msg.content);
      setConversationContext(recentMessages);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      content: inputValue,
      role: "user",
      timestamp: Date.now(),
    };

    const userQuery = inputValue;
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Generate intelligent response after a realistic delay
    // Varies the delay based on message length to simulate thinking
    const thinkingTime = Math.min(1000 + userQuery.length * 20, 3000);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateIntelligentResponse(userQuery, conversationContext),
        role: "bot",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, thinkingTime);
  };

  // Advanced response generator with context awareness
  const generateIntelligentResponse = (
    query: string,
    context: string[]
  ): string => {
    // Convert to lowercase for easier matching
    const queryLower = query.toLowerCase();

    // Check if the query contains any known note topics for better understanding
    const detectedTopics = NOTE_TOPICS.filter((topic) =>
      queryLower.includes(topic.toLowerCase())
    );

    // Log detected topics for debugging (can be removed in production)
    console.log("Detected topics:", detectedTopics);

    // If specific topics were detected but no direct question was asked, provide info about those topics
    if (
      detectedTopics.length > 0 &&
      !queryLower.includes("?") &&
      !queryLower.includes("how") &&
      !queryLower.includes("what")
    ) {
      if (detectedTopics.includes("markdown")) {
        return "I noticed you mentioned markdown. This editor supports Markdown view which you can toggle with Ctrl+M. Would you like to know more about using markdown in your notes?";
      }

      if (detectedTopics.includes("keyboard shortcuts")) {
        return "I noticed you mentioned keyboard shortcuts. This editor supports various shortcuts like Ctrl+B for bold, Ctrl+I for italic, and Ctrl+M for markdown view. Would you like to know more?";
      }

      if (
        detectedTopics.some((topic) =>
          ["formatting", "bold", "italic", "lists"].includes(topic)
        )
      ) {
        return `I see you're interested in ${detectedTopics.join(
          ", "
        )}. You can access these formatting options in the toolbar above the editor. Would you like specific instructions?`;
      }
    }

    // Check for greetings
    if (queryLower.match(/^(hi|hello|hey|greetings).*/)) {
      return "Hello! How can I assist you with your notes today?";
    }

    // Check for thanks/gratitude
    if (queryLower.match(/(thank|thanks|thank you|appreciate it|grateful).*/)) {
      return "You're welcome! I'm happy to help. Is there anything else you'd like to know?";
    }

    // Check for questions about the editor's features
    if (
      queryLower.includes("how") ||
      queryLower.includes("what") ||
      queryLower.includes("?")
    ) {
      // Formatting related questions
      if (
        queryLower.includes("format") ||
        queryLower.includes("bold") ||
        queryLower.includes("italic") ||
        queryLower.includes("underline")
      ) {
        return "You can format text using the toolbar above the editor. For bold text, select the text and click the B button or use Ctrl+B. For italic, use the I button or Ctrl+I. For underline, use the U button or Ctrl+U.";
      }

      // Headings related questions
      if (
        queryLower.includes("heading") ||
        queryLower.includes("title") ||
        queryLower.match(/h[1-3]/)
      ) {
        return "To add headings, click on H1, H2, or H3 in the toolbar depending on the heading level you need. H1 is the largest heading, while H3 is the smallest.";
      }

      // Lists related questions
      if (
        queryLower.includes("list") ||
        queryLower.includes("bullet") ||
        queryLower.includes("numbered")
      ) {
        return "You can create lists using the toolbar. Click the bullet list icon for unordered lists or the numbered list icon for ordered lists. You can also start a line with '- ' or '1. ' to automatically create a list.";
      }

      // Saving related questions
      if (queryLower.includes("save") || queryLower.includes("autosave")) {
        return "All your notes are automatically saved as you type. You don't need to manually save anything! If you want to force a save, you can use the Ctrl+S keyboard shortcut.";
      }

      // Keyboard shortcuts
      if (queryLower.includes("shortcut") || queryLower.includes("keyboard")) {
        return "Here are some useful keyboard shortcuts:\n• Ctrl+S: Force save the current note\n• Ctrl+M: Toggle Markdown view\n• Ctrl+/: Toggle this AI chat assistant\n• Ctrl+B: Bold text\n• Ctrl+I: Italic text\n• Ctrl+U: Underline text";
      }

      // Dark mode
      if (
        queryLower.includes("dark") ||
        queryLower.includes("light") ||
        queryLower.includes("theme") ||
        queryLower.includes("mode")
      ) {
        return "You can toggle between dark and light mode by clicking the theme toggle button in the top-right corner of the editor. Your preference will be saved for future sessions.";
      }

      // Links and images
      if (
        queryLower.includes("link") ||
        queryLower.includes("url") ||
        queryLower.includes("image") ||
        queryLower.includes("picture") ||
        queryLower.includes("photo")
      ) {
        return "To add a link, select the text you want to link and click the link icon in the toolbar, then enter the URL. To add an image, click the image icon and enter the image URL.";
      }

      // Markdown - direct question
      if (queryLower.includes("markdown")) {
        return "This editor supports Markdown view. You can toggle between rich text and Markdown view by clicking the 'View as Markdown' button in the top bar or using the Ctrl+M keyboard shortcut.";
      }

      // Writing tips
      if (
        queryLower.includes("writing") ||
        queryLower.includes("tip") ||
        queryLower.includes("advice") ||
        queryLower.includes("improve") ||
        queryLower.includes("better")
      ) {
        const randomTip =
          WRITING_TIPS[Math.floor(Math.random() * WRITING_TIPS.length)];
        return `Here's a writing tip: ${randomTip}. Would you like another tip or more specific advice about a particular aspect of note-taking?`;
      }

      // Study techniques
      if (
        queryLower.includes("study") ||
        queryLower.includes("technique") ||
        queryLower.includes("method") ||
        queryLower.includes("productivity") ||
        queryLower.includes("focus") ||
        queryLower.includes("concentrate")
      ) {
        const technique =
          PRODUCTIVITY_TECHNIQUES[
            Math.floor(Math.random() * PRODUCTIVITY_TECHNIQUES.length)
          ];
        return `You might want to try the **${technique.name}**: ${technique.description} Would you like to hear about other productivity techniques?`;
      }

      // General help for features
      if (
        queryLower.includes("feature") ||
        queryLower.includes("do") ||
        queryLower.includes("can")
      ) {
        return "This notes app offers rich text editing with formatting, headings, lists, links, and images. Features include:\n• Dark/light mode\n• Markdown support\n• Auto-saving\n• AI assistant (that's me!)\n• Keyboard shortcuts\n\nWhat specific feature would you like to know more about?";
      }
    }

    // Check for specific note types or templates
    if (
      queryLower.includes("template") ||
      queryLower.includes("type of note") ||
      queryLower.includes("structure") ||
      queryLower.includes("format for")
    ) {
      if (queryLower.includes("meeting") || queryLower.includes("minutes")) {
        return "For meeting notes, try this structure:\n\n**Meeting Title**\nDate: [Date]\nParticipants: [Names]\n\n**Agenda**\n1. [Item 1]\n2. [Item 2]\n\n**Discussion Points**\n- Key point 1\n- Key point 2\n\n**Action Items**\n- [ ] Task 1 (Owner, Due Date)\n- [ ] Task 2 (Owner, Due Date)\n\n**Next Steps**\n[Future plans or follow-up]";
      }

      if (
        queryLower.includes("lecture") ||
        queryLower.includes("class") ||
        queryLower.includes("course")
      ) {
        return "For lecture notes, try the Cornell method:\n\n**Topic: [Subject]**\nDate: [Date]\n\n**Main Notes Section:**\n- Key point 1 with details\n- Key point 2 with details\n\n**Cue Column (add after class):**\n- Questions about the material\n- Keywords and concepts\n\n**Summary (add after class):**\nBrief paragraph summarizing the key concepts";
      }

      if (queryLower.includes("project") || queryLower.includes("plan")) {
        return "For project planning notes, try this structure:\n\n**Project Title**\n\n**Objective:**\n[Clear statement of what the project aims to achieve]\n\n**Key Deliverables:**\n1. [Deliverable 1]\n2. [Deliverable 2]\n\n**Timeline:**\n- Phase 1: [Dates]\n- Phase 2: [Dates]\n\n**Resources Needed:**\n- [Resource 1]\n- [Resource 2]\n\n**Team Members:**\n- [Name] - [Role]\n- [Name] - [Role]\n\n**Notes:**\n[Additional information]";
      }

      if (
        queryLower.includes("daily") ||
        queryLower.includes("journal") ||
        queryLower.includes("diary")
      ) {
        return "For a daily journal entry, try this format:\n\n**Date: [Date]**\n\n**Today's Focus:**\n[Main priorities or theme for the day]\n\n**Accomplishments:**\n- [What you completed]\n- [Progress made]\n\n**Challenges:**\n- [Obstacles encountered]\n- [Problems to solve]\n\n**Insights:**\n[What you learned]\n\n**Tomorrow's Plan:**\n- [Task 1]\n- [Task 2]";
      }

      // Generic template suggestion
      return "I can suggest note templates for different purposes. Would you like a template for:\n• Meeting notes\n• Lecture notes\n• Project planning\n• Daily journal\n• Research notes\n\nJust ask for any of these specific templates!";
    }

    // Check for commands or requests
    if (queryLower.includes("help") || queryLower.includes("assist")) {
      return "I can help you with formatting, organization, and using features of this notes app. Ask me specific questions like 'How do I create headings?' or 'What keyboard shortcuts are available?' or 'Do you have a template for meeting notes?'";
    }

    // If there's context from previous messages, try to be more helpful
    if (context.length > 0) {
      const recentContext = context.join(" ").toLowerCase();

      // If the conversation has been about organization
      if (
        recentContext.includes("organize") ||
        recentContext.includes("structure") ||
        recentContext.includes("arrange")
      ) {
        return "To better organize your notes, consider using headings (H1, H2, H3) to create a clear hierarchy. You can also use bullet points for key ideas and numbered lists for sequential information or steps.";
      }

      // If the conversation has been about writing improvements
      if (
        recentContext.includes("write") ||
        recentContext.includes("writing") ||
        recentContext.includes("improve") ||
        recentContext.includes("better")
      ) {
        return "For better writing, try to use clear headings and short paragraphs. The editor supports formatting that can help emphasize important points using bold or italic text. Would you like specific suggestions for improving your current note?";
      }

      // If the conversation has been about productivity or focus
      if (
        recentContext.includes("focus") ||
        recentContext.includes("concentrate") ||
        recentContext.includes("productive") ||
        recentContext.includes("distract")
      ) {
        const technique =
          PRODUCTIVITY_TECHNIQUES[
            Math.floor(Math.random() * PRODUCTIVITY_TECHNIQUES.length)
          ];
        return `For better focus when taking notes, you might try the ${technique.name}: ${technique.description}`;
      }
    }

    // Default responses for when we don't have a specific match
    const thoughtfulResponses = [
      "That's an interesting question. To help you better with your notes, could you provide more specific details about what you're trying to accomplish?",
      "I understand you're asking about " +
        query.substring(0, 30) +
        "... Could you tell me more about what you're trying to achieve so I can provide more targeted assistance?",
      "I'd be happy to help with that. Could you share a bit more about the specific challenge you're facing with your notes?",
      "Great question! The editor supports many features that might help with this. What specific outcome are you looking for?",
      "I can definitely help with that. Let me know if you'd like me to explain any particular feature in more detail.",
    ];

    return thoughtfulResponses[
      Math.floor(Math.random() * thoughtfulResponses.length)
    ];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="chat-window"
    >
      <div className="chat-header">
        <h3 className="text-sm font-medium">Assistant</h3>
        <button onClick={onClose} className="chat-close-btn">
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
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.role === "user" ? "user" : "bot"
            }`}
          >
            {message.content}
          </div>
        ))}

        {isTyping && (
          <div className="chat-message bot animate-pulse">
            <div className="flex space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything about your notes..."
          ref={inputRef}
          className="chat-input-field"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputValue.trim()}
          aria-label="Send message"
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
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </motion.div>
  );
}
