# Visual Testing Report — АВ-Вокзал

**Date:** 2026-05-07  
**Frontend URL:** http://localhost:3000  
**Backend URL:** http://localhost:3001  
**Viewport Desktop:** 1920×1080  
**Viewport Mobile:** 375×812 (iPhone X)

---

## Summary

| Page | Desktop | Mobile | Notes |
|------|---------|--------|-------|
| Home (`/`) | ✅ PASS | ✅ PASS | All sections render correctly |
| Login (`/auth/login`) | ✅ PASS | ✅ PASS | Form fields, show/hide password |
| Register (`/auth/register`) | ✅ PASS | ✅ PASS | All 6 fields present |
| Routes (`/routes`) | ✅ PASS | ✅ PASS | Table with 1 route, horizontal scroll on mobile |
| Schedule (`/schedule`) | ✅ PASS | ✅ PASS | Empty state (no DB data) |
| Booking (`/booking`) | ✅ PASS | — | Redirects to login (auth guard) |
| Tickets (`/tickets`) | ✅ PASS | — | Redirects to login (auth guard) |
| Payment (`/payment`) | ✅ PASS | — | Redirects to login (auth guard) |
| Ticket (`/ticket`) | ✅ PASS | — | Redirects to login (auth guard) |
| Profile Favorites (`/profile/favorites`) | ✅ PASS | — | Redirects to login (auth guard) |
| Profile Tickets (`/profile/tickets`) | ✅ PASS | — | Redirects to login (auth guard) |
| Profile Settings (`/profile/settings`) | ✅ PASS | — | Redirects to login (auth guard) |
| Admin (`/admin`) | ✅ PASS | — | Redirects to login (auth guard) |
| Admin Routes (`/admin/routes`) | ✅ PASS | — | Redirects to login (auth guard) |
| Admin Users (`/admin/users`) | ✅ PASS | — | Redirects to login (auth guard) |
| Admin Bookings (`/admin/bookings`) | ✅ PASS | — | Redirects to login (auth guard) |
| Driver (`/driver`) | ✅ PASS | — | Redirects to login (auth guard) |
| Operator (`/operator`) | ✅ PASS | — | Redirects to login (auth guard) |
| Logout (`/logout`) | ✅ PASS | — | Redirects to home page |

---

## Detailed Results

### 1. Home Page (`/`)

**Desktop:** ✅ PASS  
**Mobile:** ✅ PASS

**Screenshots:**
- `tests/screenshots/home-desktop.png` — top (hero section)
- `tests/screenshots/home-desktop-mid.png` — mid (services, why choose us)
- `tests/screenshots/home-desktop-footer.png` — bottom (reviews, CTA, footer)
- `tests/screenshots/home-mobile-top.png` — mobile top (hero)
- `tests/screenshots/home-mobile-mid.png` — mobile mid (about, services)
- `tests/screenshots/home-mobile-footer.png` — mobile bottom (CTA, footer)
- `tests/screenshots/home-mobile-menu-open.png` — mobile hamburger menu

**Verified elements:**
- ✅ Navigation bar: АВ-Вокзал logo, Главная, Маршруты, Расписание, Вход
- ✅ Hero section: heading "АВ-Вокзал", subtitle, "Найти рейс" CTA button → `/routes`
- ✅ "О компании" section with description text
- ✅ "Наши услуги" — 3 cards (Междугородние рейсы, Онлайн-бронирование, Страхование)
- ✅ "Почему выбирают нас" — 4 cards (Комфорт, Точность, Безопасность, 24/7 Поддержка)
- ✅ "Отзывы клиентов" — 3 static reviews with 5-star icons
- ✅ CTA section "Готовы отправиться в путь?" with "Посмотреть маршруты" button
- ✅ Footer: 3 columns (company info, navigation links, contacts), copyright
- ✅ Mobile hamburger menu opens correctly with all 4 nav links
- ✅ Mobile layout: content stacks vertically, text wraps correctly

**Issues:** None

---

### 2. Login Page (`/auth/login`)

**Desktop:** ✅ PASS  
**Mobile:** ✅ PASS

**Screenshots:**
- `tests/screenshots/auth-login-desktop.png`
- `tests/screenshots/auth-login-mobile.png`

**Verified elements:**
- ✅ Title: "Вход в систему"
- ✅ Email field with placeholder "Введите email"
- ✅ Password field with placeholder "Введите пароль"
- ✅ Show/hide password toggle
- ✅ "Войти" button
- ✅ Link to register: "Нет аккаунта? Зарегистрироваться" → `/auth/register`
- ✅ Navigation bar and footer present
- ✅ Mobile: form card adapts to narrow viewport

**Issues:** None

---

### 3. Register Page (`/auth/register`)

**Desktop:** ✅ PASS  
**Mobile:** ✅ PASS

**Screenshots:**
- `tests/screenshots/auth-register-desktop.png`
- `tests/screenshots/auth-register-mobile.png`

**Verified elements:**
- ✅ Title: "Регистрация", subtitle "Создайте аккаунт"
- ✅ First name field (required) — "Имя *"
- ✅ Last name field (required) — "Фамилия *"
- ✅ Email field (required) — "Email *"
- ✅ Phone field (optional) — "Телефон" with placeholder "+7 (999) 000-00-00"
- ✅ Password field (required) — "Пароль *" with "Минимум 6 символов" placeholder
- ✅ Confirm password field (required) — "Подтвердите пароль *"
- ✅ Show/hide password toggles on both password fields
- ✅ "Зарегистрироваться" button
- ✅ Link to login: "Уже есть аккаунт? Войти" → `/auth/login`
- ✅ Mobile: form fields stack correctly, first/last name side-by-side

**Issues:** None

---

### 4. Routes Page (`/routes`)

**Desktop:** ✅ PASS  
**Mobile:** ✅ PASS

**Screenshots:**
- `tests/screenshots/routes-desktop.png`
- `tests/screenshots/routes-mobile.png`

**Verified elements:**
- ✅ Title: "Маршруты"
- ✅ Table with columns: Маршрут, Расстояние (км), Время (мин), Цена, Статус
- ✅ Sortable columns (Маршрут, Расстояние, Время have sort icons)
- ✅ 1 route displayed: Пермь → Омск, 800 км, 240 мин, 2000 ₽, Активный
- ✅ Status badge "Активный" with green styling
- ✅ Pagination controls (First, Previous, 1, Next, Last)
- ✅ Navigation bar and footer present
- ✅ Mobile: table has horizontal scroll (acceptable for data tables)

**Issues:** None

---

### 5. Schedule Page (`/schedule`)

**Desktop:** ✅ PASS  
**Mobile:** ✅ PASS

**Screenshots:**
- `tests/screenshots/schedule-desktop.png`
- `tests/screenshots/schedule-mobile.png`

**Verified elements:**
- ✅ Title: "Расписание рейсов"
- ✅ Table with columns: Рейс №, Маршрут, Автобус, Отправление, Прибытие, Статус
- ✅ Sortable columns (Рейс №, Автобус, Отправление, Прибытие have sort icons)
- ✅ Empty state: "No available options" (expected — no schedule data in DB)
- ✅ Pagination controls present
- ✅ Navigation bar and footer present
- ✅ Mobile: table has horizontal scroll

**Issues:** None (empty state is expected without backend data)

---

### 6. Auth-Protected Pages (Redirect to Login)

All of the following pages correctly redirect unauthenticated users to `/auth/login?redirect=<original-path>`:

| Page | Redirect URL | Screenshot |
|------|-------------|------------|
| `/booking` | `/auth/login?redirect=%2Fbooking` | `tests/screenshots/booking-redirect.png` |
| `/tickets` | `/auth/login?redirect=%2Ftickets` | — |
| `/payment` | `/auth/login?redirect=%2Fpayment` | — |
| `/ticket` | `/auth/login?redirect=%2Fticket` | — |
| `/profile/favorites` | `/auth/login?redirect=%2Fprofile%2Ffavorites` | — |
| `/profile/tickets` | `/auth/login?redirect=%2Fprofile%2Ftickets` | — |
| `/profile/settings` | `/auth/login?redirect=%2Fprofile%2Fsettings` | — |
| `/admin` | `/auth/login?redirect=%2Fadmin` | — |
| `/admin/routes` | `/auth/login?redirect=%2Fadmin%2Froutes` | — |
| `/admin/users` | `/auth/login?redirect=%2Fadmin%2Fusers` | — |
| `/admin/bookings` | `/auth/login?redirect=%2Fadmin%2Fbookings` | — |
| `/driver` | `/auth/login?redirect=%2Fdriver` | — |
| `/operator` | `/auth/login?redirect=%2Foperator` | — |

**Verified:** All 13 protected pages correctly implement auth guards with redirect preservation.

---

### 7. Logout Page (`/logout`)

**Desktop:** ✅ PASS

**Verified:**
- ✅ Navigating to `/logout` redirects to home page (`/`)
- ✅ Home page renders correctly after logout redirect

---

## Issues Found

| # | Severity | Page | Issue | Status |
|---|----------|------|-------|--------|
| — | — | — | No display issues found | — |

All pages render correctly on both desktop and mobile viewports. No broken layouts, missing content, or failed API requests were observed.

---

## Notes for Manual Review

1. **Schedule page** — Shows "No available options" because no schedule data exists in the database. This is expected behavior. Once schedule data is seeded, the table should populate correctly.
2. **Routes page** — Shows 1 route (Пермь → Омск). This appears to be seeded test data.
3. **Protected pages** — Cannot visually verify content of booking, tickets, payment, profile, admin, driver, or operator pages without authentication. Auth guard behavior is confirmed correct.
4. **Mobile tables** — Routes and Schedule tables use horizontal scroll on mobile. This is acceptable for data-dense tables but could be improved with card-based layout for better mobile UX (optional enhancement).

---

## Screenshots Index

```
tests/screenshots/
├── home-desktop.png              # Home page top (hero)
├── home-desktop-mid.png          # Home page mid (services)
├── home-desktop-footer.png       # Home page bottom (reviews, footer)
├── home-mobile-top.png           # Home mobile top (hero)
├── home-mobile-mid.png           # Home mobile mid (about, services)
├── home-mobile-footer.png        # Home mobile bottom (CTA, footer)
├── home-mobile-menu-open.png     # Home mobile hamburger menu
├── auth-login-desktop.png        # Login page desktop
── auth-login-mobile.png         # Login page mobile
├── auth-register-desktop.png     # Register page desktop
├── auth-register-mobile.png      # Register page mobile
├── routes-desktop.png            # Routes page desktop
├── routes-mobile.png             # Routes page mobile
├── schedule-desktop.png          # Schedule page desktop
├── schedule-mobile.png           # Schedule page mobile
└── booking-redirect.png          # Booking → login redirect
```

---

## Conclusion

**Overall Result: ✅ ALL PASS**

All 19 pages tested. Public pages (home, login, register, routes, schedule) render correctly on both desktop and mobile. All 13 protected pages correctly redirect unauthenticated users to login. No display issues, broken layouts, or failed requests found.
