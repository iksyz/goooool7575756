# Cloudflare NextAuth Kurulum Rehberi

## ✅ Yapılan Değişiklikler
- ✅ NextAuth'a `trustHost: true` eklendi (Cloudflare proxy için)
- ✅ `useSecureCookies` ayarı eklendi (HTTPS için)

## 🔧 Cloudflare Dashboard Ayarları

### 1. SSL/TLS Ayarları

**Cloudflare Dashboard → SSL/TLS → Overview**

- **SSL/TLS encryption mode:** `Full` veya `Full (strict)` olmalı
- ❌ `Flexible` kullanma (bu NextAuth'un secure cookies ile çakışır)

**Neden?** Flexible modda Cloudflare → Origin arası HTTP kullanır, bu NextAuth'un secure cookie gereksinimleriyle uyumsuzdur.

---

### 2. WAF (Web Application Firewall) Kuralları

**Cloudflare Dashboard → Security → WAF → Custom Rules**

NextAuth endpoint'lerini WAF'tan bypass etmek için şu kuralı ekle:

**Rule Name:** `Bypass NextAuth API`
**Expression:**
```
(http.request.uri.path matches "^/api/auth/")
```
**Action:** `Skip` (WAF'ı atla)

**Alternatif olarak:**
```
(http.request.uri.path starts_with "/api/auth/")
```

---

### 3. Bot Fight Mode

**Cloudflare Dashboard → Security → Bots**

- **Bot Fight Mode:** `Off` yap (veya NextAuth endpoint'lerini exception listesine ekle)
- **Super Bot Fight Mode:** `Off` yap

**Neden?** Bot Fight Mode NextAuth callback isteklerini bot olarak algılayıp engelleyebilir.

---

### 4. Rocket Loader

**Cloudflare Dashboard → Speed → Optimization → Rocket Loader**

- **Rocket Loader:** `Off` yap

**Neden?** Rocket Loader JavaScript'i optimize ederken NextAuth callback'lerini bozabilir.

---

### 5. Page Rules (Alternatif - Eğer WAF Custom Rules çalışmazsa)

**Cloudflare Dashboard → Rules → Page Rules**

Şu kuralı ekle:

**URL Pattern:** `goaltrivia.com/api/auth/*`

**Settings:**
- **Security Level:** `Essentially Off`
- **Rocket Loader:** `Off`
- **Disable Apps:** `On` (isteğe bağlı)

---

## 🔍 Test ve Doğrulama

### 1. SSL/TLS Kontrolü

Tarayıcıda şu URL'yi aç:
```
https://goaltrivia.com/api/auth/debug
```

Sayfa açılıyorsa SSL çalışıyor demektir.

### 2. WAF Bypass Kontrolü

Tarayıcıda şu URL'yi aç:
```
https://goaltrivia.com/api/auth/signin
```

Sayfa açılıyorsa WAF bypass çalışıyor demektir.

### 3. Google OAuth Test

1. `https://goaltrivia.com` adresine git
2. "Giriş Yap" butonuna tıkla
3. Google ile giriş yapmayı dene
4. Hata alırsan Cloudflare Dashboard'da "Security Events" sekmesine bak

---

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata: "Missing CSRF token"
**Sebep:** Cloudflare WAF CSRF token'ı engelliyor
**Çözüm:** WAF Custom Rule ekle (yukarıdaki adım 2)

### Hata: "OAuthCallback" veya "OAuthSignin"
**Sebep:** Cloudflare Bot Fight Mode callback'i engelliyor
**Çözüm:** Bot Fight Mode'u kapat veya exception ekle (yukarıdaki adım 3)

### Hata: "Secure cookie" hatası
**Sebep:** SSL/TLS mode "Flexible"
**Çözüm:** SSL/TLS mode'u "Full" veya "Full (strict)" yap (yukarıdaki adım 1)

### Hata: JavaScript çalışmıyor
**Sebep:** Rocket Loader NextAuth script'lerini bozuyor
**Çözüm:** Rocket Loader'ı kapat (yukarıdaki adım 4)

---

## 📋 Kontrol Listesi

- [ ] SSL/TLS mode "Full" veya "Full (strict)"
- [ ] WAF Custom Rule eklendi (`/api/auth/*` bypass)
- [ ] Bot Fight Mode kapalı veya exception eklendi
- [ ] Rocket Loader kapalı
- [ ] Page Rules eklendi (isteğe bağlı)
- [ ] Test endpoint'leri çalışıyor (`/api/auth/debug`, `/api/auth/test-db`)
- [ ] Google OAuth test edildi

---

## 🔗 Faydalı Linkler

- [Cloudflare WAF Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)
- [Cloudflare SSL/TLS Modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [NextAuth Cloudflare Deployment](https://next-auth.js.org/deployment)
