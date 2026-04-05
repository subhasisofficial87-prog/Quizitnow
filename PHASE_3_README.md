# Phase 3: Gemini Integration

## ✅ What's New in Phase 3

- ✅ **Gemini API Integration** - Google's Gemini 2.0 Flash model
- ✅ **Quiz Generation Endpoint** - POST `/api/quiz/generate`
- ✅ **System Prompt** - Detailed prompt for exactly 31 questions
- ✅ **JSON Parsing** - Validates and parses Gemini responses
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Real API Calls** - Replaces mock with production code

## 📂 New Files Created

```
lib/
  └── gemini.ts                 (Gemini API wrapper)

app/api/quiz/
  └── generate/route.ts         (Quiz generation endpoint)

Updated:
  ├── package.json              (Added @google/generative-ai)
  ├── app/page.tsx              (Real API calls)
  ├── .env.local                (Environment variables)
  └── PHASE_3_README.md          (This file)
```

## 🔑 Setup Instructions

### Step 1: Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy your API key
4. **Keep it secret!** Don't commit to git

### Step 2: Configure Environment Variables

Edit `.env.local` (already created):

```env
GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Do NOT commit `.env.local` to git!** It's in `.gitignore`

### Step 3: Install New Dependency

```bash
npm install
```

This will install `@google/generative-ai` package.

### Step 4: Start Dev Server

```bash
npm run dev
```

Server runs on `http://localhost:3002` (or next available port)

## 🧪 Testing Phase 3

### Test 1: Verify API Key Configuration

```bash
# Check if env var is loaded
echo $GEMINI_API_KEY
```

Should show your API key (if terminal supports it)

### Test 2: Test API Endpoint Directly

```bash
curl -X POST http://localhost:3002/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Photosynthesis in plants"}'
```

Expected response:
```json
{
  "success": true,
  "quiz": {
    "id": "quiz-1...",
    "title": "Photosynthesis in plants",
    "questions": { ... },
    ...
  }
}
```

### Test 3: Test in Browser

1. Go to http://localhost:3002
2. Enter a topic: "Photosynthesis in plants"
3. Click "🚀 Generate Quiz"
4. Wait 10-30 seconds (Gemini API latency)
5. See success toast message
6. Should redirect to quiz page (Phase 4)

### Test 4: Check Logs

Watch terminal for debug output:
```
[Gemini] Generating quiz from topic: Photosynthesis...
[Gemini] Received response, parsing...
[Gemini] Quiz generated successfully: Easy=10, Medium=10, Hard=11, Total=31
[API] POST /api/quiz/generate - Topic: Photosynthesis...
[Home] Quiz generated successfully, redirecting to display page
```

## 📋 System Prompt Details

The system prompt in `lib/gemini.ts` ensures:

✅ Exactly 31 questions (fixed distribution):
  - 10 Multiple Choice (MCQ)
  - 5 Fill-in-the-Blank
  - 4 One-Word Answer
  - 4 True/False
  - 4 Match the Following
  - 4 Assertion & Reason

✅ Difficulty distribution:
  - 10 Easy (fundamentals)
  - 10 Medium (understanding)
  - 11 Hard (analysis)

✅ Question structure:
  - Content/question text
  - Correct answer(s)
  - Short explanation

✅ JSON format:
  ```json
  {
    "success": true,
    "questions": {
      "easy": [...],
      "medium": [...],
      "hard": [...]
    },
    "stats": { ... }
  }
  ```

## 🔧 API Route Details

### POST /api/quiz/generate

**Request:**
```json
{
  "topic": "Photosynthesis in plants"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "quiz": {
    "id": "quiz-1...",
    "title": "Photosynthesis in plants",
    "sourceType": "topic",
    "createdAt": "2026-04-05T...",
    "questions": { ... },
    "stats": { ... }
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

### GET /api/quiz/generate

Health check endpoint. Returns:
```json
{
  "status": "ready",
  "message": "Quiz generation endpoint is ready..."
}
```

## ⚠️ Common Issues & Solutions

### Issue 1: Invalid API Key
**Error**: "Invalid Gemini API key"
**Solution**:
1. Check key at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Copy full key (including any dashes)
3. Update `.env.local`
4. Restart dev server: `npm run dev`

### Issue 2: API Quota Exceeded
**Error**: "API quota exceeded"
**Solution**:
- Free tier has usage limits
- Wait 1 hour or upgrade to paid plan
- Check quotas at Google Cloud Console

### Issue 3: Timeout (>30 seconds)
**Causes**:
- Network latency
- Gemini API processing time
- Server is slow
**Solutions**:
- Check internet connection
- Try again (it's usually fast)
- Shorter topic = faster response

### Issue 4: Invalid JSON Response
**Error**: "Failed to parse quiz from AI response"
**Solutions**:
1. Check console logs for actual response
2. Verify system prompt is correct
3. Try again (API can be inconsistent)
4. Increase response timeout

### Issue 5: Module Not Found
**Error**: "Cannot find module '@google/generative-ai'"
**Solution**:
```bash
npm install
npm run dev
```

## 🚀 How It Works

1. **User enters topic** → QuizInput component
2. **User clicks "Generate Quiz"** → handleGenerateClick()
3. **POST to /api/quiz/generate** → Sends topic
4. **Server calls Gemini API** → generateQuizWithGemini()
5. **Gemini generates 31 questions** → Parses JSON
6. **Validate structure** → Ensure format is correct
7. **Return quiz data** → Send to frontend
8. **Store in sessionStorage** → Save for display page
9. **Redirect to /quiz** → Show generated questions

## 📊 Phase 3 Metrics

| Metric | Value | Status |
|--------|-------|--------|
| API Integration | ✅ Complete | Gemini 2.0 Flash |
| System Prompt | ✅ Complete | 31 questions enforced |
| Error Handling | ✅ Complete | Comprehensive |
| JSON Parsing | ✅ Complete | Validated |
| Testing | Ready | See testing section |
| Build | Ready | `npm run build` |

## 📝 Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `GEMINI_API_KEY` | Gemini API authentication | `AIza...` |
| `NEXT_PUBLIC_APP_URL` | App URL for redirects | `http://localhost:3000` |

**Note**: `GEMINI_API_KEY` starts with `AIza...`

## 🔄 Data Flow

```
User Input (Topic)
    ↓
QuizInput Component (validate)
    ↓
POST /api/quiz/generate
    ↓
generateQuizWithGemini()
    ↓
Google Gemini API
    ↓
Parse JSON Response
    ↓
Validate Structure (31 questions)
    ↓
Return Quiz Data
    ↓
sessionStorage.setItem('generatedQuiz', quiz)
    ↓
router.push('/quiz')
    ↓
Next Phase: Display Generated Quiz
```

## ✅ Testing Checklist

### Configuration
- [ ] `.env.local` created
- [ ] `GEMINI_API_KEY` set correctly
- [ ] `npm install` run
- [ ] No module errors

### API Testing
- [ ] `npm run dev` starts
- [ ] No console errors
- [ ] GET /api/quiz/generate returns 200
- [ ] POST /api/quiz/generate works

### Integration Testing
- [ ] Enter topic in UI
- [ ] Click "Generate Quiz"
- [ ] See info toast: "Generating quiz..."
- [ ] Wait 10-30 seconds
- [ ] See success toast: "Quiz generated!"
- [ ] (Will fail at /quiz redirect - Phase 4 not done)

### Error Testing
- [ ] Empty topic shows error
- [ ] Topic < 10 chars shows error
- [ ] Invalid API key shows error
- [ ] Error toasts appear correctly

## 🎯 Ready for Phase 4!

Phase 3 is complete! Next phase:

**Phase 4: Quiz Display Page**
- Create `/quiz` page to display generated questions
- Show questions grouped by difficulty
- Color-code: Green (Easy), Yellow (Medium), Red (Hard)
- Add "Show Answer" button for each question
- Estimated time: 1-1.5 hours

---

**Status: READY FOR TESTING** 🧪

1. Get your Gemini API key
2. Add to `.env.local`
3. Run `npm install && npm run dev`
4. Test the quiz generation!
