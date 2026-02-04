# OAuth Test Adımları

## 1. Direkt SignIn URL'ini Test Edin

Tarayıcınızda şu URL'yi açın:
```
https://goaltrivia.com/api/auth/signin
```

Bu sayfa NextAuth'ın varsayılan signin sayfasını göstermeli ve Google ile giriş yapma butonu olmalı.

## 2. Google OAuth URL'ini Direkt Test Edin

Tarayıcınızda şu URL'yi açın (Client ID'nizi kullanarak):
```
https://accounts.google.com/o/oauth2/v2/auth?client_id=731576276483-shhcrcbm6ctajq4ik4fqrf9h5aikr84h.apps.googleusercontent.com&redirect_uri=https://goaltrivia.com/api/auth/callback/google&response_type=code&scope=openid%20email%20profile&access_type=offline
```

Bu direkt Google OAuth sayfasına götürmeli.

## 3. Browser Console Kontrolü

1. `https://goaltrivia.com/admin/generator` sayfasına gidin
2. F12 ile Developer Tools'u açın
3. Console sekmesine bakın
4. "Sign In" butonuna tıklayın
5. Console'da şu mesajları arayın:
   - `Sign In button clicked`
   - `Sign in error:` (varsa)
   - Herhangi bir kırmızı hata mesajı

## 4. Network Tab Kontrolü

1. Developer Tools'da Network sekmesine geçin
2. "Sign In" butonuna tıklayın
3. Şu istekleri bulun:
   - `/api/auth/signin`
   - `accounts.google.com` istekleri
4. Bu isteklerin Status kodlarını kontrol edin

## 5. Kritik Kontroller

### Google Cloud Console:
- Redirect URI: `https://goaltrivia.com/api/auth/callback/google` (sonunda `/` olmamalı)
- Test kullanıcısı: `emreipekyuz7@gmail.com` ekli olmalı
- Publishing status: "Testing" modunda olmalı

### Cloudflare Pages:
- `NEXTAUTH_URL=https://goaltrivia.com` (tırnak işareti olmadan)
- `GOOGLE_CLIENT_ID` doğru olmalı
- `GOOGLE_CLIENT_SECRET` doğru olmalı
- `NEXTAUTH_SECRET` doğru olmalı
