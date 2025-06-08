# AI Chat Application

A modern chat application built with Next.js, featuring AI-powered conversations using the GROQ API. The application provides a sleek user interface with real-time chat capabilities, message threading, and markdown support.

## Features

- 💬 Real-time chat interface
- 🤖 AI-powered responses using GROQ API
- 📝 Markdown support with syntax highlighting
- 🔄 Message threading and replies
- 🌙 Dark mode support
- 📱 Responsive design
- 🎨 Modern UI with animations

## Tech Stack

- Next.js 14 / React 18.3.1
- TypeScript
- Tailwind CSS
- Framer Motion
- GROQ API
- React Markdown
- Shadcn UI Components

## Prerequisites

- Node.js 18+ 
- npm or yarn
- GROQ API key

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/bebdyshev/.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your GROQ API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your GROQ API key for AI chat functionality |

## Deployment

The application can be deployed to Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add the `GROQ_API_KEY` environment variable in your Vercel project settings
4. Deploy!

## Project Structure

```
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    # Chat API endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chat/
│   │   ├── ChatHeader.tsx
│   │   ├── ChatList.tsx
│   │   ├── Message.tsx
│   │   ├── MessageInput.tsx
│   │   ├── MessageList.tsx
│   │   └── types.ts
│   └── ui/                 # Shadcn UI components
├── public/
└── styles/
    └── globals.css
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 