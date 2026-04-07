# QuizItNow v2.0

A modern, AI-powered quiz generation application built with Next.js 15, React 19, and TypeScript. Generate quizzes from topics with a beautiful, responsive interface.

## 🚀 Features

- **Local Quiz Generation**: No external API dependencies - everything runs locally
- **31 Questions per Quiz**: Perfectly distributed across 6 question types
  - 10 Multiple Choice Questions (MCQ)
  - 5 Fill-in-the-blank questions
  - 4 One-word answer questions
  - 4 True/False questions
  - 4 Match-the-following questions
  - 4 Assertion & Reason questions

- **3 Difficulty Levels**: 10 Easy, 10 Medium, 11 Hard questions
- **Modern UI**: Built with Tailwind CSS, Sky Blue & Baby Pink theme
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Fast Performance**: Production-optimized Next.js build

## 📋 Project Structure

```
QuizItNow/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Quiz generation API endpoint
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage with quiz generator UI
│   └── globals.css               # Global styles
├── lib/
│   ├── local-quiz-generator.ts   # Core quiz generation logic
│   └── quiz-types.ts             # TypeScript interfaces
├── public/                        # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config (strict mode)
├── tailwind.config.ts            # Tailwind theme
├── next.config.js                # Next.js config
└── README.md                     # This file
```

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: Next.js bundler with SWC
- **Package Manager**: npm
- **Deployment Ready**: Vercel, self-hosted, or Docker

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/subhasisofficial87-prog/Quizitnow.git
cd QuizItNow
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

## 🔨 Available Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## 📝 API Reference

### POST /api/generate

Generate a quiz from a topic.

**Request:**
```json
{
  "topic": "Photosynthesis"
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "id": "quiz-1712502400000",
    "title": "Photosynthesis",
    "sourceType": "topic",
    "createdAt": "2024-04-07T10:00:00.000Z",
    "questions": {
      "easy": [...],
      "medium": [...],
      "hard": [...]
    },
    "stats": {
      "totalQuestions": 31,
      "byType": {
        "mcq": 10,
        "fillBlank": 5,
        "oneWord": 4,
        "trueFalse": 4,
        "match": 4,
        "assertionReason": 4
      }
    }
  }
}
```

### GET /api/generate

Health check endpoint.

**Response:**
```json
{
  "status": "ready",
  "message": "Quiz generation endpoint is ready. Use POST to generate quizzes."
}
```

## 🎨 Color Theme

- **Sky Blue**: `#0EA5E9` - Primary color, easy level questions
- **Baby Pink**: `#F9A8D4` - Secondary color, accent
- **Gray**: Various gray shades for text and backgrounds

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Select your GitHub repository
5. Click "Deploy"
6. Your site will be live in seconds!

**No environment variables needed** - the app works completely locally.

### Deploy to Self-Hosted Server

```bash
# Build for production
npm run build

# Start server
npm run start

# Or use PM2 for process management
npm install -g pm2
pm2 start "npm start" --name "quizitnow"
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security

- No external API calls required
- No API keys needed
- All processing is local
- Strict TypeScript mode enabled
- Input validation on API endpoints
- CORS-ready for future API integrations

## 🚧 Future Enhancements

The v2.0 architecture is designed to easily add:
- PDF upload and text extraction
- Image OCR (Tesseract.js ready)
- Supabase database integration (placeholders in place)
- User authentication (Firebase, Supabase)
- Quiz history and results tracking
- More advanced AI integration if needed

## 📄 License

This project is provided as-is for educational purposes.

## 👨‍💻 Development Notes

### TypeScript Strict Mode

The project uses TypeScript with strict mode enabled. This ensures:
- No implicit `any` types
- Null/undefined checking
- Strict function types
- All potential errors are caught at compile time

### Code Style

- Components use functional components with hooks
- Server components by default (React 19)
- `'use client'` directive only where needed
- Tailwind utility-first CSS approach
- JSDoc comments for complex functions

## 📞 Support

For issues or questions:
1. Check the GitHub repository
2. Open an issue on GitHub
3. Review the code comments and JSDoc

---

**Version**: 2.0.0
**Last Updated**: April 7, 2024
**Status**: Production Ready ✅
