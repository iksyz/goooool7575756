# 🎯 User Quiz Oluşturma ve Admin Onay Sistemi - Kurulum Rehberi

## ✅ Tamamlanan İşlemler

### 1. Database Schema (Prisma)
- ✅ `QuizStatus` enum eklendi: `PENDING`, `PUBLISHED`, `REJECTED`
- ✅ `UserQuiz` modeli oluşturuldu:
  - Tüm quiz alanları (title, league, category, difficulty, seo fields, questions)
  - `status` field (default: PENDING)
  - `rejectionReason` field (opsiyonel)
  - `creator` relation (User modeline bağlı)
- ✅ `User` modeline `createdQuizzes` relation eklendi

### 2. UI - Ana Sayfa
- ✅ `app/page.tsx`: "✨ Create Your Own Quiz" butonu eklendi
- ✅ Butonda özel hover efektleri ve animasyonlar

### 3. Quiz Oluşturma Formu
- ✅ `app/create-quiz/page.tsx`: Tam özellikli quiz oluşturma formu
  - Login kontrolü
  - Başlık, lig, kategori, zorluk, açıklama
  - Dinamik soru ekleme/çıkarma (minimum 5, maksimum 15)
  - Her soru için 4 şık + fun fact
  - Doğru cevap radio button seçimi
  - Form validasyonu

### 4. Quiz Submit API
- ✅ `app/api/user-quiz/submit/route.ts`:
  - Login kontrolü
  - AI filtresi (`aiFilter.ts`) - sadece futbol içeriği kabul eder
  - Slug generation (otomatik + timestamp)
  - Status: PENDING olarak kaydetme
  - SEO keywords extraction

### 5. Admin Panel
- ✅ `app/admin/pending-quizzes/page.tsx`: Server component
  - Admin yetki kontrolü
  - Pending quiz'leri listeler
- ✅ `components/admin/PendingQuizzesClient.tsx`: Client component
  - Quiz listesi (creator bilgisiyle)
  - "View Details" modal
  - "Approve" butonu → PUBLISHED
  - "Reject" butonu → REJECTED (sebep sorulur)
  - Real-time güncelleme

### 6. Admin Action API
- ✅ `app/api/admin/quiz-action/route.ts`:
  - Admin yetki kontrolü
  - `APPROVE` action → status = PUBLISHED
  - `REJECT` action → status = REJECTED + rejectionReason

### 7. Quiz Data Helper
- ✅ `lib/quiz-data.ts`:
  - `getQuizBySlug()`: JSON + database (PUBLISHED)
  - `getAllQuizzes()`: JSON + database (PUBLISHED)
  - Hem JSON hem user-created quiz'leri birleştirir

### 8. Quiz Detail Sayfaları Güncellemesi
- ✅ `app/quiz/[slug]/page.tsx`: User quiz'leri de gösterir
- ✅ `app/quiz/[slug]/play/page.tsx`: User quiz'leri de oynatır
- ✅ Sadece PUBLISHED status'teki quiz'ler görünür

### 9. AI Filter Güncellemesi
- ✅ `lib/ai/aiFilter.ts`: 500+ futbol keyword'ü eklendi
  - Takımlar, ligler, stadyumlar, efsaneler, teknik direktörler
  - Türkçe + İngilizce + diğer diller
  - Taktikler, pozisyonlar, ödüller

---

## 🚀 Kurulum Adımları

### 1. Prisma Migration Çalıştır
```powershell
cd "C:\Users\emre ipekyüz\Desktop\goal-trivia\goooool7575756"

# Migration oluştur
npx prisma migrate dev --name add_user_quiz_system

# Prisma Client'ı güncelle
npx prisma generate
```

### 2. Environment Variables (Cloudflare Pages)
Cloudflare Pages Dashboard → Settings → Environment Variables:
```
DATABASE_URL=your_neon_or_supabase_postgresql_url
ADMIN_EMAILS=admin@example.com,admin2@example.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://goal-trivia.pages.dev
NEXTAUTH_SECRET=...
```

### 3. Deploy
```powershell
git add .
git commit -m "feat: user quiz creation and admin approval system"
git push origin main
```

Cloudflare Pages otomatik deploy edecek.

---

## 📖 Kullanım Rehberi

### Kullanıcı İçin
1. Ana sayfada "✨ Create Your Own Quiz" butonuna tıkla
2. Google ile giriş yap
3. Formu doldur:
   - Quiz başlığı
   - Lig/Turnuva
   - Kategori (Leagues, Legends, vb.)
   - Zorluk (Easy, Medium, Hard)
   - Açıklama (1-2 cümle)
   - En az 5 soru ekle (her biri 4 şık + fun fact)
4. "Submit for Review" butonuna bas
5. AI filtresi çalışır:
   - ✅ Futbol içeriği → PENDING olarak kaydedilir
   - ❌ Futbol dışı → Hata mesajı
6. Admin onayını bekle

### Admin İçin
1. `/admin/pending-quizzes` sayfasına git
2. Pending quiz'leri gör:
   - Başlık, kategori, zorluk, creator bilgisi
   - "View Details" ile quiz içeriğini incele
3. Karar ver:
   - ✅ **Approve**: Quiz PUBLISHED olur → sitede görünür
   - ❌ **Reject**: Quiz REJECTED olur → sebep yazılır

---

## 🎨 Tasarım Özellikleri
- ✅ Modern, glassmorphism efektler
- ✅ Smooth animasyonlar (Framer Motion)
- ✅ Futbol temalı renkler (emerald-950, green, yellow)
- ✅ Dark mode uyumlu
- ✅ Responsive design (mobile-first)
- ✅ Tailwind CSS

---

## 🔒 Güvenlik Özellikleri
- ✅ NextAuth session kontrolü (her API'de)
- ✅ Admin yetki kontrolü (`requireAdmin()`)
- ✅ AI filtresi (aiFilter.ts) - sadece futbol içeriği
- ✅ SQL injection koruması (Prisma)
- ✅ XSS koruması (React)
- ✅ CSRF token (NextAuth)

---

## 📊 Database İlişkileri
```
User (1) ←→ (N) UserQuiz
  └─ email                      └─ creatorId (FK)
  └─ createdQuizzes             └─ status (PENDING/PUBLISHED/REJECTED)
```

---

## 🔄 Quiz Flow
```
User creates quiz
    ↓
AI Filter checks content
    ↓
✅ Football → Save as PENDING
❌ Non-football → Reject
    ↓
Admin reviews
    ↓
✅ Approve → PUBLISHED (visible on site)
❌ Reject → REJECTED (not visible)
```

---

## 🧪 Test Checklist
- [ ] Quiz oluşturma formu çalışıyor
- [ ] AI filtresi futbol içeriğini kabul ediyor
- [ ] AI filtresi futbol dışı içeriği reddediyor
- [ ] Admin panel pending quiz'leri listeler
- [ ] Admin approve butonu çalışıyor
- [ ] Admin reject butonu çalışıyor
- [ ] Approved quiz'ler ana sayfada görünüyor
- [ ] Approved quiz'ler oynanabiliyor
- [ ] Rejected quiz'ler görünmüyor

---

## 📝 Notlar
- User quiz'ler JSON quizleriyle birleştirilir (`lib/quiz-data.ts`)
- Sadece PUBLISHED status'teki quiz'ler kullanıcılara görünür
- SEO content boş bırakılır (user-created için)
- Slug formatı: `{title-slug}-{timestamp}`
- PointsPerCorrect: Easy=10, Medium=15, Hard=20

---

## 🎯 Sonraki Adımlar (Opsiyonel)
- [ ] User'a kendi quiz'lerini görme paneli
- [ ] Quiz edit özelliği (approved sonrası)
- [ ] Quiz istatistikleri (kaç kez oynandı)
- [ ] Email notification (approved/rejected)
- [ ] Bulk approve/reject (admin için)
- [ ] Quiz versiyonlama
- [ ] Community voting system

---

Sistem hazır! 🚀 Migration'ı çalıştırıp deploy edebilirsin.
