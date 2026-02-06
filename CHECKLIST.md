# ✅ Son Kontrol Listesi

## 🔧 Kod Değişiklikleri (Tamamlandı)
- [x] JWT mode'a geçiş yapıldı
- [x] Session callback JWT için güncellendi
- [x] JWT callback user bilgilerini ekliyor
- [x] Prisma schema Supabase için optimize edildi (@db.Text)
- [x] Cloudflare cookies ayarları eklendi
- [x] Middleware eklendi (CSRF koruması)
- [x] Google Provider allowDangerousEmailAccountLinking eklendi

## 📋 Yapılması Gerekenler

### 1. Prisma Migration (ÖNEMLİ!)
Schema değişiklikleri için migration çalıştır:

```powershell
cd "C:\Users\emre ipekyüz\Desktop\goal-trivia\goooool7575756"
$env:DATABASE_URL="postgresql://postgres.rqzjukeskjfaviztzcni:1072%3FEmrE%3F%3F@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
npx prisma db push
```

### 2. Cloudflare Pages Environment Variables
Cloudflare Dashboard → Pages → goaltrivia → Settings → Environment Variables → Production

Şu variable'ların olduğundan emin ol:
- [ ] `DATABASE_URL` = `postgresql://postgres.rqzjukeskjfaviztzcni:1072%3FEmrE%3F%3F@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- [ ] `NEXTAUTH_URL` = `https://goaltrivia.com` (sonunda `/` olmamalı, tırnak yok)
- [ ] `NEXTAUTH_SECRET` = `FF4EnpuUJj6bqS9qnTrpXDU/KdfByMnJL7I4cUzaHqo=` (tırnak yok)
- [ ] `GOOGLE_CLIENT_ID` = `405208981746-qipip7oe7okutjvp90906vhbhq0c03i6.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` = `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`
- [ ] `ADMIN_EMAILS` = `emreipekyuz7@gmail.com`

### 3. Cloudflare Dashboard Ayarları
Cloudflare Dashboard → goaltrivia.com domain'i

- [ ] **SSL/TLS → Overview**: Mode = `Full` veya `Full (strict)` (Flexible değil!)
- [ ] **Security → WAF → Custom Rules**: `/api/auth/*` bypass kuralı eklendi
- [ ] **Security → Bots**: Bot Fight Mode = `Off`
- [ ] **Speed → Optimization**: Rocket Loader = `Off`

### 4. Google Cloud Console
- [ ] **Credentials → OAuth 2.0 Client ID**: 
  - Authorized redirect URIs'de `https://goaltrivia.com/api/auth/callback/google` var
- [ ] **OAuth consent screen**:
  - Test users listesine `emreipekyuz7@gmail.com` eklendi
  - VEYA Publishing status = "In production"

### 5. Deploy ve Test
- [ ] Değişiklikleri commit et ve push et
- [ ] Cloudflare Pages deploy tamamlandı
- [ ] Gizli sekmede test et:
  - `https://goaltrivia.com` → Google ile giriş yap
  - `/admin/generator` sayfasına git
  - Çalışıyor mu kontrol et

---

## 🚨 Sorun Devam Ederse

1. **Test endpoint'lerini kontrol et:**
   - `https://goaltrivia.com/api/auth/debug`
   - `https://goaltrivia.com/api/auth/test-db`

2. **Cloudflare Logs kontrol et:**
   - Cloudflare Dashboard → Security → Events
   - `/api/auth/callback/google` için hata var mı?

3. **Browser Console kontrol et:**
   - F12 → Console sekmesi
   - Hata mesajları var mı?
