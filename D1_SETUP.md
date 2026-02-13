# Cloudflare D1 Setup Guide

## 1. D1 Veritabanı Oluştur

```bash
# D1 database oluştur
wrangler d1 create goal-trivia-db

# Output'ta DATABASE_ID'yi kaydet
```

## 2. wrangler.toml Güncellemesi

`wrangler.toml` dosyasına D1 binding ekle:

```toml
[[d1_databases]]
binding = "DB"
database_name = "goal-trivia-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

## 3. Schema Migration

```bash
# Local development için
wrangler d1 execute goal-trivia-db --local --file=./migrations/001_initial_schema.sql

# Production için
wrangler d1 execute goal-trivia-db --file=./migrations/001_initial_schema.sql
```

## 4. Kod Güncellemesi

### `lib/db.ts` - getDb() fonksiyonunu güncelle:

```typescript
export function getDb() {
    // Cloudflare Workers ortamında
    if (typeof globalThis !== 'undefined' && (globalThis as any).DB) {
        return (globalThis as any).DB;
    }
    return null;
}
```

### `middleware.ts` veya `_worker.js` - DB binding'i context'e ekle:

Eğer OpenNext Cloudflare kullanıyorsanız, worker ortamında `env.DB`'ye erişebilirsiniz.

## 5. Migration Komutları

```bash
# Schema'yı kontrol et
wrangler d1 execute goal-trivia-db --command "SELECT name FROM sqlite_master WHERE type='table';"

# Kullanıcı sayısını kontrol et
wrangler d1 execute goal-trivia-db --command "SELECT COUNT(*) FROM users;"

# Tüm tabloları göster
wrangler d1 execute goal-trivia-db --command ".tables"
```

## 6. Local Development

```bash
# Local D1 instance ile development
npm run dev
# veya
wrangler pages dev .vercel/output/static --compatibility-date=2024-01-01 --d1=DB=goal-trivia-db
```

## 7. Production Deploy

```bash
# Deploy et
npm run cf:deploy

# Deploy sonrası migration çalıştır
wrangler d1 execute goal-trivia-db --file=./migrations/001_initial_schema.sql
```

## 8. Data Reset (Dikkat!)

```bash
# Tüm datayi sil (UYARI: GERİ ALINAMAZ)
wrangler d1 execute goal-trivia-db --command "DELETE FROM quiz_submissions; DELETE FROM users;"
```

## 9. Backup

```bash
# Veritabanını export et
wrangler d1 export goal-trivia-db --output=backup.sql

# Restore et
wrangler d1 execute goal-trivia-db --file=backup.sql
```

## 10. Monitoring

Cloudflare Dashboard'dan D1 kullanımını izle:
- https://dash.cloudflare.com → Workers & Pages → D1

## Notlar

- D1 ücretsiz tier: 5 GB storage, 5 million row reads/day
- SQL syntax: SQLite compatible
- Foreign keys: Enabled by default
- Transactions: Supported
- Full-text search: MATCH ve FTS5 destekli
