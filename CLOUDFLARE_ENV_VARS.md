# Cloudflare Pages Environment Variables

## 📋 Cloudflare Pages'e Eklenecek Variable'lar

Cloudflare Dashboard → Pages → goaltrivia → Settings → Environment Variables → **Production**

### 1. DATABASE_URL
**Variable Name:** `DATABASE_URL`  
**Value:** 
```
postgresql://postgres.rqzjukeskjfaviztzcni:1072%3FEmrE%3F%3F@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 2. NEXTAUTH_URL
**Variable Name:** `NEXTAUTH_URL`  
**Value:** 
```
https://goaltrivia.com
```
**ÖNEMLİ:** Sonunda `/` olmamalı, tırnak işareti olmamalı!

### 3. NEXTAUTH_SECRET
**Variable Name:** `NEXTAUTH_SECRET`  
**Value:** 
```
FF4EnpuUJj6bqS9qnTrpXDU/KdfByMnJL7I4cUzaHqo=
```
**ÖNEMLİ:** Tırnak işareti olmamalı!

### 4. GOOGLE_CLIENT_ID
**Variable Name:** `GOOGLE_CLIENT_ID`  
**Value:** 
```
214173882906-qfpaevjbbb874a0qlg8grq91rahgvngm.apps.googleusercontent.com
```

### 5. GOOGLE_CLIENT_SECRET
**Variable Name:** `GOOGLE_CLIENT_SECRET`  
**Value:** 
```
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
```

### 6. ADMIN_EMAILS
**Variable Name:** `ADMIN_EMAILS`  
**Value:** 
```
emreipekyuz7@gmail.com
```

### 7. AUTH_TRUST_HOST (Cloudflare Proxy İçin)
**Variable Name:** `AUTH_TRUST_HOST`  
**Value:** 
```
true
```
**ÖNEMLİ:** Bu variable Cloudflare proxy hatasını çözer. NextAuth'un Cloudflare arkasında çalışması için gereklidir!

---

## ✅ Kontrol Listesi

- [ ] Tüm 7 variable Cloudflare Pages'e eklendi
- [ ] `NEXTAUTH_URL` sonunda `/` yok
- [ ] `NEXTAUTH_SECRET` tırnak işareti yok
- [ ] `AUTH_TRUST_HOST=true` eklendi (Cloudflare proxy için kritik!)
- [ ] `DATABASE_URL` doğru (Session Pooler)
- [ ] `GOOGLE_CLIENT_ID` güncel (214173882906-qfpaevjbbb874a0qlg8grq91rahgvngm)
- [ ] Deploy sonrası test edildi

---

## 🔍 Kontrol Et

Deploy sonrası şu URL'yi kontrol et:
```
https://goaltrivia.com/api/auth/debug
```

Bu sayfada tüm variable'ların doğru göründüğünden emin ol.
