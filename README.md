# ✨ Elegant Notes Editor

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TipTap-2.12-purple?style=for-the-badge" alt="TipTap 2.12" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript 5" />
</div>

A beautiful, distraction-free note-taking application with a rich text editor, built with modern web technologies. Create, edit, and organize your notes with a sleek and intuitive interface.

## ✨ Features

- **💫 Beautiful UI**: Clean, modern interface with smooth animations and transitions
- **📝 Rich Text Editing**: Support for headings, formatting, lists, links, and images
- **🌙 Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **💾 Auto-Save**: Your notes are automatically saved as you type
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🤖 AI Assistant**: Chat with an AI assistant to help with your notes
- **📚 Markdown Support**: View your notes in Markdown format
- **⌨️ Keyboard Shortcuts**: Enhance your productivity with keyboard shortcuts

## 🚀 Technologies

This project leverages modern web technologies to deliver a smooth and responsive user experience:

- **React 19** - Latest UI library with improved performance
- **Next.js 15** - The React framework for production
- **TipTap Editor** - Headless, customizable rich-text editor based on ProseMirror
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Framer Motion** - Library for animations and transitions
- **Zustand** - Lightweight state management
- **React Markdown** - Markdown rendering

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/my-notes-editor.git
   cd my-notes-editor
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📋 Application Structure

```
my-notes-editor/
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # React components
│   │   ├── Chat.tsx     # AI chat assistant
│   │   ├── Editor.tsx   # Rich text editor
│   │   ├── Note.tsx     # Note component
│   │   └── Sidebar.tsx  # Sidebar navigation
│   ├── store/           # Zustand state management
│   └── lib/             # Utility functions
├── public/              # Static assets
└── ...
```

## 🎮 Usage Guide

### Creating a Note

- Click the "New Note" button in the sidebar
- Enter a title for your note
- Start typing in the editor

### Formatting Text

- Use the toolbar to format your text
- Apply headings, bold, italic, underline, and strikethrough
- Create ordered and unordered lists
- Add links and images

### Keyboard Shortcuts

- `Ctrl+S` - Force save the current note
- `Ctrl+M` - Toggle Markdown view
- `Ctrl+/` - Toggle AI chat assistant

### AI Assistant

- Click the chat bubble in the bottom right corner to open the AI assistant
- Ask questions or get suggestions for your notes

## 🔧 Customization

### Themes

The application includes a light and dark theme. Toggle between them using the theme button in the top-right corner.

### Editor Settings

The editor is built with TipTap and can be customized further by modifying the `Editor.tsx` component.

## 🚢 Deployment

The easiest way to deploy this application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project to Vercel
3. Deploy with one click

You can also deploy using other platforms like Netlify, AWS Amplify, or any service that supports Next.js applications.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Next.js Team](https://nextjs.org/) for the incredible React framework
- [TipTap](https://tiptap.dev/) for the powerful editor framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) for the smooth animations

---

<div align="center">
  Made with ❤️ for productive note-taking
</div>
