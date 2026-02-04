# OAuth Sorun Giderme Kontrol Listesi

## ✅ Kritik Kontroller

### 1. Google Cloud Console - OAuth Client Ayarları

1. **Google Cloud Console'a gidin:**
   - https://console.cloud.google.com/apis/credentials

2. **OAuth client'ınızı bulun:**
   - Client ID: `731576276483-shhcrcbm6ctajq4ik4fqrf9h5aikr84h`
   - Name: `goaltriviva`

3. **OAuth client'ını açın ve kontrol edin:**

   **Authorized JavaScript origins:**
   ```
   https://goaltrivia.com
   ```
   - Sonunda `/` OLMAMALI
   - `http://` değil, `https://` olmalı

   **Authorized redirect URIs:**
   ```
   https://goaltrivia.com/api/auth/callback/google
   ```
   - Sonunda `/` OLMAMALI
   - `http://` değil, `https://` olmalı
   - Tam olarak bu şekilde olmalı
   - Başka bir redirect URI varsa SİLİN

4. **Kaydedin ve 5-10 dakika bekleyin**

### 2. OAuth Consent Screen Ayarları

1. **Google Cloud Console → OAuth consent screen**

2. **Test users sekmesine gidin:**
   - `emreipekyuz7@gmail.com` ekli olmalı
   - Yoksa "+ Add Users" ile ekleyin

3. **Publishing status:**
   - "Testing" modunda olmalı
   - "In production" değil

### 3. Environment Variables (Cloudflare Pages)

Cloudflare Pages Dashboard → Settings → Environment Variables:

```
GOOGLE_CLIENT_ID=731576276483-shhcrcbm6ctajq4ik4fqrf9h5aikr84h.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXTAUTH_URL=https://goaltrivia.com
NEXTAUTH_SECRET=FF4EnpuUJj6bqS9qnTrpXDU/KdfByMnJL7I4cUzaHqo=
```

**Önemli:**
- `NEXTAUTH_URL` sonunda `/` OLMAMALI
- Tüm değerlerde boşluk olmamalı
- Tırnak işareti olmamalı

### 4. Debug Kontrolü

1. **Debug endpoint'ini kontrol edin:**
   ```
   https://goaltrivia.com/api/auth/debug
   ```

2. **Şunların `true` olduğundan emin olun:**
   - `hasClientId: true`
   - `hasClientSecret: true`
   - `hasNextAuthSecret: true`
   - `critical: "Tüm environment variables ayarlı"`

### 5. Test Adımları

1. **Deploy edin** (environment variables değiştiyse)

2. **5-10 dakika bekleyin** (Google ayarlarının güncellenmesi için)

3. **Test edin:**
   - `https://goaltrivia.com/admin/generator` sayfasına gidin
   - "Sign In" butonuna tıklayın
   - Google hesabınızla giriş yapın (`emreipekyuz7@gmail.com`)

4. **Hata alırsanız:**
   - Browser console'u açın (F12)
   - Network tab'inde `/api/auth/callback/google` isteğini bulun
   - Response'u kontrol edin
   - Cloudflare Pages loglarını kontrol edin

## 🔍 Yaygın Hatalar

### Hata: "OAuthSignin"
**Neden:** Redirect URI yanlış veya eksik
**Çözüm:** Google Cloud Console'da redirect URI'yi kontrol edin

### Hata: "Access blocked"
**Neden:** Test kullanıcısı eklenmemiş
**Çözüm:** OAuth consent screen → Test users → E-posta adresinizi ekleyin

### Hata: "redirect_uri_mismatch"
**Neden:** Redirect URI tam olarak eşleşmiyor
**Çözüm:** Google Cloud Console'da redirect URI'yi tam olarak `https://goaltrivia.com/api/auth/callback/google` olarak ayarlayın
