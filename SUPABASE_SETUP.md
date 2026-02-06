# Supabase Veritabanı Kurulum Rehberi

## ✅ Yapılan Değişiklikler
- ✅ Neon adapter kaldırıldı, normal PostgreSQL bağlantısına geçildi
- ✅ `lib/prisma.ts` Supabase için güncellendi

## 📋 Adımlar

### 1. Supabase Session Pooler Connection String'i Al

1. **Supabase Dashboard'a git**: https://supabase.com/dashboard
2. **Projeni seç** → **Settings** → **Database**
3. **"Connection Pooling"** bölümüne git
4. **"Session Pooler"** seçeneğini aktif et
5. **"Connection String"** sekmesine git
6. **"Yöntem"** dropdown'ından **"Session Pooler"** seç
7. Connection string şu formatta olacak:
   ```
   postgresql://postgres.zdiauuzangrqnbcdkzvj:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```
8. **`[YOUR-PASSWORD]`** kısmını gerçek veritabanı şifrenle değiştir
9. **Connection string'i kopyala**

### 2. Local .env Dosyasını Güncelle

`.env` dosyasındaki `DATABASE_URL`'i Session Pooler connection string ile değiştir:

```env
DATABASE_URL=postgresql://postgres.zdiauuzangrqnbcdkzvj:[ŞİFREN]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**ÖNEMLİ:** 
- `[ŞİFREN]` kısmını gerçek şifrenle değiştir
- Tırnak işareti **KULLANMA** (direkt string olarak yaz)

### 3. Cloudflare Pages'e DATABASE_URL Ekle

1. **Cloudflare Dashboard** → **Pages** → **goaltrivia** projesi
2. **Settings** → **Environment Variables**
3. **Production** sekmesine git
4. **`DATABASE_URL`** variable'ını bul veya **"Add variable"** ile ekle
5. **Value** olarak Session Pooler connection string'i yapıştır
6. **Save** butonuna tıkla

### 4. Prisma Migration Çalıştır

Local'de migration çalıştır (veritabanı tablolarını oluşturur):

```bash
cd goooool7575756
npx prisma migrate dev --name init
```

Veya sadece schema'yı push et:

```bash
npx prisma db push
```

### 5. Deploy ve Test

1. Değişiklikleri commit et ve push et
2. Cloudflare Pages otomatik deploy edecek
3. Deploy sonrası test et:
   - `/api/auth/test-db` → Veritabanı bağlantısını test et
   - `/api/auth/debug` → Tüm environment variable'ları kontrol et
   - Google Sign-In'i dene

## 🔍 Troubleshooting

### IPv4 Uyarısı
Eğer "IPv4 uyumlu değil" uyarısı görüyorsan:
- ✅ **Session Pooler** kullan (yukarıdaki adımlar)
- ❌ **Direct Connection** kullanma (Cloudflare Pages ile çalışmaz)

### Connection String Formatı
Doğru format:
```
postgresql://postgres.PROJECT_REF:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Yanlış format (Direct Connection):
```
postgresql://postgres:[PASSWORD]@db.PROJECT_REF.supabase.co:5432/postgres
```

### Prisma Migration Hatası
Eğer migration hatası alırsan:
```bash
# Prisma client'ı yeniden generate et
npx prisma generate

# Schema'yı push et
npx prisma db push
```
