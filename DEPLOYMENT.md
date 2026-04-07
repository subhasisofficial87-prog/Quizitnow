# QuizItNow v2.0 - Deployment Guide

## 🚀 Deploy to Vercel (Recommended - 1 Click!)

### Step 1: Verify GitHub is Connected
Your code is already pushed to: https://github.com/subhasisofficial87-prog/Quizitnow

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New Project"**
3. Select your GitHub repository: **"Quizitnow"**
4. Click **"Import"**
5. Vercel will auto-detect Next.js settings
6. Click **"Deploy"**

**That's it!** Your app will be live in 1-2 minutes ✨

---

## 🌍 Custom Domain Setup (Optional)

To use **quizitnow.com**:

1. In Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain: `quizitnow.com`
3. Vercel will show you nameservers to configure
4. Go to your domain registrar (Namecheap, GoDaddy, etc.)
5. Update nameservers to match Vercel's
6. Wait 24-48 hours for DNS propagation
7. SSL certificate will auto-install ✅

---

## 🔐 Optional: Set Up Supabase (For Authentication & History)

### Why?
- User accounts & login
- Save quiz history
- Share progress across devices

### Setup Steps:

#### 1. Create Supabase Project
1. Go to https://supabase.com
2. Click **"Start your project"**
3. Create account or sign in
4. Click **"New Project"**
5. Fill in project details:
   - **Name**: `quizitnow`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
6. Click **"Create new project"** (wait ~2 min)

#### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy these two values:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

#### 3. Run Database Migrations
1. In Supabase → **SQL Editor**
2. Click **"New Query"**
3. Paste contents of `supabase-schema.sql` file
4. Click **"Run"** (green play button)
5. Tables and security policies created ✅

#### 4. Add to Vercel Environment
1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add two variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [paste Project URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [paste anon key]
   ```
3. Select all environments (Production, Preview, Development)
4. Click **"Save"**
5. Vercel auto-redeploys 🚀

#### 5. Enable Email Authentication (Optional)
1. In Supabase → **Authentication** → **Providers**
2. Enable **Email** provider
3. Users can now sign up via your app

---

## ✅ Verification Checklist

After deployment, test these features:

- [ ] Homepage loads (should see "QuizItNow" title)
- [ ] Generate quiz from topic
- [ ] PDF upload works (try with any PDF)
- [ ] Image upload works (try with screenshot/photo)
- [ ] Generate quiz displays 31 questions
- [ ] "Take Quiz Now" button works
- [ ] Timer counts down
- [ ] Submit quiz shows results page
- [ ] Results show correct grade and explanations
- [ ] (Optional) Login/signup page works
- [ ] (Optional) Dashboard saves quiz history

---

## 🔑 Environment Variables Summary

| Variable | Required | Where to Get |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase → Settings → API |

**Note**: The app works completely without Supabase! Auth & history are optional.

---

## 🎯 What's Working on Vercel

✅ **Core Features** (No setup needed):
- Quiz generation from any topic
- PDF text extraction
- Image OCR (camera photos)
- Quiz taking with timer
- Results & scoring
- Responsive design

✅ **Optional Features** (With Supabase):
- User authentication
- Quiz history saving
- Dashboard/profile
- Progress tracking

---

## 🆘 Troubleshooting

### "PDF extraction not working"
- PDF worker loads from CDN - check browser console for errors
- Vercel builds auto-include dependencies ✅

### "Image OCR taking long"
- Tesseract.js downloads language files on first use (~65MB)
- Subsequent uses are much faster
- This is normal for OCR libraries

### "Supabase not connecting"
- Check environment variables in Vercel are correct
- Verify you ran the SQL migration in Supabase
- Supabase is optional - app still works without it

### "Quiz not generating"
- Check browser console (F12 → Console)
- Verify `/api/generate` endpoint works:
  ```bash
  curl -X POST https://your-app.vercel.app/api/generate \
    -H "Content-Type: application/json" \
    -d '{"topic": "Biology"}'
  ```

---

## 📊 Production Build Info

```
Route Size / First Load JS
/                      3.12 kB / 105 kB
/api/generate          130 B / 102 kB
/auth/login           1.97 kB / 165 kB
/auth/signup          2.19 kB / 165 kB
/dashboard            2.34 kB / 165 kB
/quiz-mode            2.18 kB / 104 kB
/results              1.72 kB / 104 kB
```

**Total**: ~560 KB (optimized for fast loading)

---

## 🔄 Updates & Redeployment

Vercel auto-redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically redeploys!
# Check https://vercel.com/dashboard to see deployment progress
```

---

## 🎉 You're Done!

Your QuizItNow app is now live! 🚀

- **Main App**: https://your-project.vercel.app
- **Custom Domain**: https://quizitnow.com (after DNS setup)
- **Dashboard**: https://your-project.vercel.app/dashboard (with Supabase)

Share your app with friends and teachers! 📚✨

---

## 📞 Need Help?

1. **Vercel Issues**: https://vercel.com/support
2. **Supabase Issues**: https://supabase.com/docs
3. **Next.js Issues**: https://nextjs.org/docs
4. **Code Issues**: Check browser console (F12) for errors

**Happy quizzing!** 🎯
