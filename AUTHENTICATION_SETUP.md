# 🔐 Authentication & Authorization - Kurulum Rehberi

## ✅ Tamamlanan Yeni Özellikler

### 1. **CreateQuizButton Component (Login Kontrolü)**
- ✅ `components/CreateQuizButton.tsx`: Yeni component
  - NextAuth `useSession` ile giriş kontrolü
  - **Giriş yapmamış kullanıcı**: Şık modal uyarısı + Google login butonu
  - **Giriş yapmış kullanıcı**: `/create-quiz` sayfasına yönlendirilir
  - Modal tasarımı:
    - Gradient background blur
    - Google icon + "Sign in with Google" butonu
    - "Maybe Later" seçeneği
    - Smooth animasyonlar (Framer Motion)

### 2. **Middleware (Route Protection)**
- ✅ `middleware.ts`: NextAuth JWT token kontrolü
  - **Protected Routes**:
    - `/create-quiz` → Login gerektirir
    - `/admin/*` → Admin yetkisi gerektirir
    - `/profile` → Login gerektirir
  - **Yetkisiz Erişim**:
    - Login olmadan: `/?auth=required` redirect
    - Admin değilken: `/?auth=admin-required` redirect
  - Matcher config ile API ve static dosyalar hariç tutulur

### 3. **User Model (Role Field)**
- ✅ Prisma schema'ya `UserRole` enum eklendi:
  ```prisma
  enum UserRole {
    USER
    ADMIN
  }
  ```
- ✅ `User` modeline `role` field eklendi:
  ```prisma
  role UserRole @default(USER)
  ```
  - Default: `USER`
  - Admin kullanıcılar `ADMIN` olarak işaretlenebilir

### 4. **Ana Sayfa Güncellemesi**
- ✅ `app/page.tsx`: CreateQuizButton component'i entegre edildi
- ✅ "Create Your Own Quiz" butonu artık login kontrolü yapıyor

---

## 🎯 Authentication Flow

### Kullanıcı Senaryoları:

#### 1. **Giriş Yapmamış Kullanıcı**
```
User clicks "Create Your Own Quiz"
    ↓
Modal açılır: "Sign In Required"
    ↓
User "Sign in with Google" tuşuna basar
    ↓
Google OAuth flow
    ↓
Callback: /create-quiz sayfası
```

#### 2. **Giriş Yapmış Kullanıcı**
```
User clicks "Create Your Own Quiz"
    ↓
Direkt /create-quiz sayfasına yönlendirilir
```

#### 3. **Admin Olmayan Kullanıcı (/admin girişi)**
```
User tries /admin
    ↓
Middleware checks ADMIN_EMAILS
    ↓
❌ Not admin → Redirect to /?auth=admin-required
```

#### 4. **Admin Kullanıcı**
```
User tries /admin
    ↓
Middleware checks ADMIN_EMAILS
    ↓
✅ Is admin → Access granted
```

---

## 🚀 Kurulum Adımları

### 1. Prisma Migration
```powershell
cd "C:\Users\emre ipekyüz\Desktop\goal-trivia\goooool7575756"

# UserRole enum ve role field için migration
npx prisma migrate dev --name add_user_role

# Prisma Client güncelle
npx prisma generate
```

### 2. Environment Variables
Cloudflare Pages Dashboard → Settings → Environment Variables:
```env
# Existing
DATABASE_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_URL=https://goal-trivia.pages.dev
NEXTAUTH_SECRET=...

# Admin Emails (virgülle ayrılmış)
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### 3. NextAuth Configuration
`lib/auth.ts` zaten yapılandırılmış:
- Google OAuth provider
- Prisma adapter
- Session strategy: JWT

### 4. Deploy
```powershell
git add .
git commit -m "feat: add authentication and authorization with middleware"
git push origin main
```

---

## 🔒 Güvenlik Özellikleri

### Middleware Protection
- ✅ JWT token validation (NextAuth)
- ✅ Route-based access control
- ✅ Admin email whitelist
- ✅ Automatic redirects

### API Protection
- ✅ `requireAdmin()` helper in admin APIs
- ✅ `getServerSession()` in protected APIs
- ✅ User ownership checks

### Client-Side UX
- ✅ Friendly login prompts
- ✅ No jarring error pages
- ✅ Smooth redirects

---

## 📖 Component Kullanımı

### CreateQuizButton
```tsx
import { CreateQuizButton } from "@/components/CreateQuizButton";

<CreateQuizButton />
```

**Props**: Yok (internal state management)

**Features**:
- Auto-detects login status
- Shows modal if not logged in
- Handles Google OAuth flow
- Redirects to `/create-quiz` after login

---

## 🎨 Modal Tasarımı

### Login Prompt Modal
- **Background**: Black overlay (50% opacity) + backdrop blur
- **Card**: White rounded-3xl with shadow-2xl
- **Icon**: Gradient circle (yellow to orange) + LogIn icon
- **Button**: Gradient blue (blue-600 to blue-700)
- **Animation**: Scale + fade in (Framer Motion)
- **Close**: Click outside or "Maybe Later" button

---

## 🧪 Test Checklist

### Authentication Flow
- [ ] Giriş yapmadan "Create Your Own Quiz" butonuna tıklama
- [ ] Modal açılıyor ve "Sign in with Google" çalışıyor
- [ ] Google OAuth flow başarılı
- [ ] Callback sonrası `/create-quiz` sayfasına yönlendirilme
- [ ] Giriş yapmış kullanıcı direkt `/create-quiz` açabiliyor

### Middleware Protection
- [ ] `/create-quiz` giriş olmadan erişilemiyor
- [ ] `/admin` admin değilken erişilemiyor
- [ ] `/admin` admin ise açılıyor
- [ ] Redirect URL'leri doğru (`?auth=required`, `?auth=admin-required`)

### User Role
- [ ] Yeni kullanıcı default `role: USER` ile oluşturuluyor
- [ ] Admin kullanıcı manuel olarak `role: ADMIN` yapılabiliyor
- [ ] Admin panel sadece admin role'e sahip kullanıcılara açık

---

## 📊 Database Schema Updates

### Before
```prisma
model User {
  id    String @id @default(cuid())
  email String? @unique @db.Text
  ...
}
```

### After
```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  id    String   @id @default(cuid())
  email String?  @unique @db.Text
  role  UserRole @default(USER)
  ...
}
```

---

## 🔄 Admin Yetki Kontrolü

### Şu anki Yöntem (ADMIN_EMAILS)
```typescript
// lib/admin.ts
export function isAdminEmail(email?: string | null) {
    const admins = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim());
    return admins?.includes(email?.toLowerCase() ?? "");
}
```

### Gelecekteki Yöntem (Database Role) - Opsiyonel
```typescript
// lib/admin.ts - future enhancement
export async function isAdminByRole(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    return user?.role === "ADMIN";
}
```

---

## 🎯 Kullanıcı Deneyimi

### Login Akışı
1. **Giriş yapmamış kullanıcı**: Butona tıklar
2. **Modal açılır**: "Sign In Required" mesajı
3. **Google login**: Tek tık ile OAuth flow
4. **Callback**: Direkt quiz oluşturma sayfası
5. **Hiçbir kesinti yok**: Smooth UX

### Admin Akışı
1. **Admin kullanıcı**: ADMIN_EMAILS listesinde
2. **/admin rotaları**: Otomatik erişim
3. **Pending quiz'leri**: Onaylama/reddetme yetkisi
4. **Diğer kullanıcılar**: "Access Denied" redirect

---

## 📝 Notlar

### ADMIN_EMAILS vs Database Role
- **Şu an**: `ADMIN_EMAILS` environment variable (hızlı setup)
- **Gelecek**: Database `role` field (scalable)
- **Tavsiye**: Production'da database role'e geçiş

### Middleware Matcher
```typescript
matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)"
]
```
- API routes excluded (own auth)
- Static files excluded (public access)
- Images excluded (optimization)

### Session Storage
- **Strategy**: JWT (Cloudflare Workers uyumlu)
- **Provider**: Google OAuth
- **Adapter**: Prisma (database-backed sessions)

---

## 🚦 Sonraki Adımlar (Opsiyonel)

### Authentication Enhancements
- [ ] Email/password login (opsiyonel)
- [ ] Magic link authentication
- [ ] Two-factor authentication (2FA)
- [ ] Remember me functionality

### Authorization Enhancements
- [ ] Database role-based permissions
- [ ] Moderator role (PENDING quiz review)
- [ ] User permissions matrix
- [ ] Role assignment UI (admin panel)

### UX Enhancements
- [ ] Toast notifications (login success/error)
- [ ] Loading states during OAuth
- [ ] Session expiry warnings
- [ ] Auto-save quiz drafts

---

Sistem hazır! Migration'ı çalıştır ve test et. 🚀

## 🔗 İlgili Dosyalar
- `components/CreateQuizButton.tsx` - Login kontrolü + modal
- `middleware.ts` - Route protection
- `prisma/schema.prisma` - UserRole enum + User.role
- `lib/admin.ts` - Admin yetki kontrolü
- `app/page.tsx` - CreateQuizButton entegrasyonu
