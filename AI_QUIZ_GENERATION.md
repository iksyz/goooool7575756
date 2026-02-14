# 🤖 AI-Powered Quiz Generation - Kurulum Rehberi

## ✅ Tamamlanan Sistem

### 🎯 Özellikler

**Kullanıcı Tarafı**:
- ✅ Sadece **topic** (konu başlığı) ve **category** (kategori) gir
- ✅ AI otomatik olarak 5 soru + 4 şık + fun fact oluşturur
- ✅ Login kontrolü (giriş yapmadan quiz oluşturulamaz)
- ✅ Modern AI temalı gradient tasarım
- ✅ Real-time feedback (loading, success, error)

**AI Generation (Gemini)**:
- ✅ Gemini Pro API entegrasyonu
- ✅ Prompt engineering (5 soru, teknik doğruluk, çeldirici şıklar)
- ✅ JSON validation (strict format checking)
- ✅ AI Filter (sadece futbol konuları kabul edilir)
- ✅ Auto-generated slug, title, SEO keywords

**Admin Paneli**:
- ✅ Kategori filtresi (📁 All, 🏆 Leagues, ⭐ Legends, vb.)
- ✅ AI Generated badge
- ✅ Topic görüntüleme
- ✅ Approve/Reject butonları
- ✅ Quiz sayısı gösterimi (her kategoride kaç quiz var)

---

## 🗂️ Database Schema (Prisma)

### Yeni Enum: QuizCategory
```prisma
enum QuizCategory {
  LEAGUES
  LEGENDS
  NOSTALGIA
  TACTICS
  NATIONS
  DERBIES
  RECORDS
  TOURNAMENTS
}
```

### UserQuiz Model Güncellemeleri
```prisma
model UserQuiz {
  // Eski alan: league (String) → SİLİNDİ
  // Yeni alanlar:
  topic        String       @db.Text  // Kullanıcının girdiği konu
  category     QuizCategory            // Enum (LEAGUES, LEGENDS, vb.)
  aiGenerated  Boolean      @default(true)  // AI tarafından mı oluşturuldu
  
  // Diğer alanlar aynı (title, slug, questions, status, vb.)
}
```

---

## 🚀 Kurulum Adımları

### 1. Environment Variables
Cloudflare Pages Dashboard → Settings → Environment Variables:
```env
# Existing
DATABASE_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://goal-trivia.pages.dev
NEXTAUTH_SECRET=...
ADMIN_EMAILS=admin@example.com

# NEW - Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini API Key nasıl alınır:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) git
2. "Create API Key" butonuna tıkla
3. API key'i kopyala ve Cloudflare Pages'e ekle

### 2. Prisma Migration
```powershell
cd "C:\Users\emre ipekyüz\Desktop\goal-trivia\goooool7575756"

# Category enum ve UserQuiz field güncellemeleri için migration
npx prisma migrate dev --name ai_quiz_generation

# Prisma Client güncelle
npx prisma generate
```

### 3. Deploy
```powershell
git add .
git commit -m "feat: AI-powered quiz generation with Gemini"
git push origin main
```

Cloudflare Pages otomatik deploy edecek.

---

## 📖 Kullanım Rehberi

### Kullanıcı İçin (Quiz Oluşturma)

1. **Ana sayfada** "✨ Create Your Own Quiz" butonuna tıkla
2. **Google ile giriş** yap (yoksa modal çıkar)
3. **/create-quiz** sayfası açılır:
   - **Topic** gir: "2005 Champions League Final" veya "Arda Güler Career"
   - **Category** seç: 🏆 Leagues, ⭐ Legends, 🕰️ Nostalgia, vb.
4. **"Generate Quiz"** butonuna bas
5. **AI işlem yapıyor**: (10-15 saniye)
   - Gemini API'ye istek gönderir
   - 5 soru + 4 şık + fun fact oluşturur
   - AI Filter kontrolü yapar
   - PENDING olarak kaydeder
6. **Başarı mesajı**: "✨ Quiz generated successfully!"
7. **Admin onayını bekle**

### Admin İçin (Quiz Onaylama)

1. **/admin/pending-quizzes** sayfasına git
2. **Kategori filtresi** seç:
   - 📁 All Categories (tümü)
   - 🏆 Leagues
   - ⭐ Legends
   - 🕰️ Nostalgia
   - 📋 Tactics
   - 🌍 Nations
   - ⚔️ Derbies
   - 📈 Records
   - 🏅 Tournaments
3. **Quiz'i incele**:
   - Title, topic, category, difficulty görünür
   - "AI Generated" badge
   - "View Details" butonu ile soruları gör
4. **Karar ver**:
   - ✅ **Approve**: Quiz PUBLISHED olur → sitede görünür
   - ❌ **Reject**: Quiz REJECTED olur → görünmez

---

## 🤖 AI Generation Akışı

```
User enters topic + category
    ↓
Submit to /api/ai-generate-quiz
    ↓
AI Filter checks topic (football-related?)
    ↓
❌ Non-football → Error: "This topic must be about football only!"
✅ Football → Continue
    ↓
Send to Gemini Pro API
    ↓
Prompt: "Generate 5 quiz questions about {topic} in {category}..."
    ↓
Gemini response (JSON)
    ↓
Validate JSON structure
    ↓
❌ Invalid → Error: "Failed to generate quiz"
✅ Valid → Continue
    ↓
Create slug, title, SEO keywords
    ↓
Save to database (status: PENDING, aiGenerated: true)
    ↓
Success response → User redirected to homepage
```

---

## 🎨 Tasarım Özellikleri

### /create-quiz Sayfası
- **Animated Background**: Gradient blur circles (pulse animation)
- **Card**: Glass effect (white/80 + backdrop-blur)
- **Header Icon**: Purple-to-pink gradient circle + Wand2 icon
- **Title**: Gradient text (purple-600 to pink-600)
- **Topic Input**:
  - Border: purple-200 → purple-400 (focus)
  - Ring: purple-200/50 (focus)
  - Placeholder tip: 💡 icon
- **Category Grid**:
  - 2 columns (sm) → 4 columns (lg)
  - Active: Purple-pink gradient + white text
  - Inactive: White/50 + purple-200 border
  - Emoji icons (🏆, ⭐, 🕰️, vb.)
  - Layout animation (Framer Motion layoutId)
- **Submit Button**:
  - Gradient: purple-600 to pink-600
  - Hover: scale 1.05 + glow effect
  - Loading: Spinner + "Generating with AI..."

### Admin Panel
- **Category Filter**:
  - Pill-shaped buttons
  - Active: Purple-pink gradient
  - Inactive: White/50 + border
  - Badge: Quiz count per category
- **Quiz Cards**:
  - AI Generated badge (gradient)
  - Topic field (bold)
  - Category icon + name
  - Difficulty, question count

---

## 🔒 Güvenlik Özellikleri

### AI Filter
```typescript
const filterResult = aiFilter(topic, "This topic must be about football only!");
if (!filterResult.ok) {
    return { error: filterResult.error };
}
```
- 500+ futbol keyword'ü kontrol eder
- Futbol dışı konuları reddeder

### Authentication
- NextAuth session kontrolü
- Middleware protection (`/create-quiz` için login gerekir)
- Admin email whitelist

### Validation
- Topic: required, trimmed
- Category: enum validation (LEAGUES, LEGENDS, vb.)
- AI response: strict JSON structure checking
- Questions: exactly 5, each with 4 options

---

## 📊 Gemini API Details

### Endpoint
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

### Prompt Template
```
You are a professional football quiz generator. Generate exactly 5 high-quality football quiz questions about "{topic}" in the "{category}" category.

STRICT REQUIREMENTS:
- Questions MUST be about football/soccer ONLY
- Questions should be technically accurate and challenging
- Each question has exactly 4 options
- One option is correct, others are plausible distractors
- Include a fun fact for each option (1 sentence)

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text?",
    "options": [
      { "text": "Option 1", "funFact": "Fact 1" },
      { "text": "Option 2", "funFact": "Fact 2" },
      { "text": "Option 3", "funFact": "Fact 3" },
      { "text": "Option 4", "funFact": "Fact 4" }
    ],
    "correctIndex": 0
  }
]
```

### Generation Config
```json
{
  "temperature": 0.7,
  "topK": 40,
  "topP": 0.95,
  "maxOutputTokens": 2048
}
```

### Response Handling
1. Extract text from `data.candidates[0].content.parts[0].text`
2. Clean markdown code blocks (```json ... ```)
3. Parse JSON
4. Validate: 5 questions, 4 options each, correctIndex 0-3
5. Return questions array

---

## 🧪 Test Checklist

### User Flow
- [ ] Giriş yapmadan "Create Quiz" butonu login modal gösterir
- [ ] Giriş sonrası /create-quiz açılır
- [ ] Topic + category girip "Generate Quiz" çalışır
- [ ] AI loading state gösterir (spinner + "Generating...")
- [ ] Başarılı generation: Success message + redirect
- [ ] Başarısız generation: Error message

### AI Generation
- [ ] Futbol konusu: Quiz oluşturulur (PENDING)
- [ ] Futbol dışı konu: AI Filter reddeder
- [ ] Gemini API yanıt verir (5 soru + 4 şık)
- [ ] JSON validation çalışır
- [ ] Database'e kaydedilir (aiGenerated: true)

### Admin Panel
- [ ] Kategori filtresi çalışır (ALL, LEAGUES, LEGENDS, vb.)
- [ ] Quiz count badge doğru gösterir
- [ ] AI Generated badge görünür
- [ ] Topic field görünür
- [ ] Approve/Reject butonları çalışır
- [ ] Filtrelenmiş kategoride quiz yoksa "No pending quizzes" gösterir

---

## 📝 Önemli Notlar

### Gemini API Limits
- **Free tier**: 60 requests/minute
- **Token limit**: 2048 output tokens per request
- **Rate limit hatası**: 429 Too Many Requests

### Database Migration
- **Breaking change**: `league` field kaldırıldı
- Eski quiz'ler etkilenmez (JSON quizzes.json'dan gelir)
- Yeni quiz'ler `topic` + `category` enum kullanır

### Category Mapping
```typescript
const CATEGORIES = [
    { value: "LEAGUES", label: "Leagues", icon: "🏆" },
    { value: "LEGENDS", label: "Legends", icon: "⭐" },
    { value: "NOSTALGIA", label: "Nostalgia", icon: "🕰️" },
    { value: "TACTICS", label: "Tactics", icon: "📋" },
    { value: "NATIONS", label: "Nations", icon: "🌍" },
    { value: "DERBIES", label: "Derbies", icon: "⚔️" },
    { value: "RECORDS", label: "Records", icon: "📈" },
    { value: "TOURNAMENTS", label: "Tournaments", icon: "🏅" },
];
```

---

## 🎯 Sonraki Adımlar (Opsiyonel)

### AI Enhancements
- [ ] Multiple AI providers (OpenAI, Claude as fallback)
- [ ] Difficulty auto-detection (Easy/Medium/Hard)
- [ ] Question variety (multiple choice, true/false, fill-in-blank)
- [ ] Image generation for questions (DALL-E/Midjourney)

### User Experience
- [ ] Quiz draft saving (incomplete submissions)
- [ ] Edit quiz before submission
- [ ] Preview quiz before sending to admin
- [ ] Quiz history (user'ın oluşturduğu quiz'ler)
- [ ] Notification (quiz approved/rejected)

### Admin Tools
- [ ] Bulk approve/reject
- [ ] Edit quiz questions (minor corrections)
- [ ] Category reassignment
- [ ] Quality scoring (AI confidence score)

---

## 🔗 İlgili Dosyalar

### Backend
- `app/api/ai-generate-quiz/route.ts` - Gemini API entegrasyonu
- `lib/ai/aiFilter.ts` - Futbol keyword filter (500+ words)
- `prisma/schema.prisma` - QuizCategory enum + UserQuiz model

### Frontend
- `app/create-quiz/page.tsx` - AI quiz generation form
- `components/admin/PendingQuizzesClient.tsx` - Category filter + admin panel
- `components/CreateQuizButton.tsx` - Login kontrolü + modal

---

## 💡 Örnek Kullanım

### Topic Examples
- ✅ "2005 Champions League Final"
- ✅ "Arda Güler's Career"
- ✅ "Barcelona vs Real Madrid Clásico History"
- ✅ "Premier League 2022/23 Season"
- ❌ "Artificial Intelligence" (Non-football)
- ❌ "Basketball History" (Non-football)

### AI Generated Quiz Example
**Topic**: "2005 Champions League Final"  
**Category**: TOURNAMENTS

**Questions** (AI-generated):
1. Who scored Liverpool's first goal in the 2005 Champions League Final?
   - A) Steven Gerrard ✅
   - B) Xabi Alonso
   - C) Luis García
   - D) Djibril Cissé

2. What was the half-time score in the 2005 Champions League Final?
   - A) AC Milan 3-0 Liverpool ✅
   - B) AC Milan 2-0 Liverpool
   - C) AC Milan 1-0 Liverpool
   - D) 0-0

... (3 more questions)

---

Sistem hazır! Gemini API key'i ekle, migration çalıştır ve deploy et! 🚀

**Powered by Gemini Pro AI** 🤖✨
