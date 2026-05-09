# WORKLOG - Разработка информационной системы "Автовокзал"

> Дата начала: 2026-04-24

---

## Backend (NestJS + Prisma)

### Выполненные задачи:

#### 1. Реализация RoutesService с Prisma
- **Файл:** `backend/src/modules/routes/routes.service.ts`
- **Функции:** findAll, findOne, create, update, remove, search
- **Статус:** ✅ Реализовано (не заглушка)

#### 2. Реализация TripsService с Prisma
- **Файл:** `backend/src/modules/trips/trips.service.ts`
- **Функции:** findAll, findOne, create, update, remove, getByDriver, getDelayed, updateTime, getByDate, getAvailableSeats
- **Статус:** ✅ Реализовано (не заглушка)

#### 3. Реализация BookingsService с Prisma
- **Файл:** `backend/src/modules/bookings/bookings.service.ts`
- **Функции:** findAll, findOne, create, update, remove, getByUser, confirm, cancel
- **Особенность:** Автоматический расчёт цены на основе маршрута
- **Статус:** ✅ Реализовано (не заглушка)

#### 4. Реализация PaymentsService с Prisma
- **Файл:** `backend/src/modules/payments/payments.service.ts`
- **Функции:** findAll, findOne, findByBooking, create, update, process, refund
- **Особенность:** Симуляция обработки платежа с генерацией transactionId
- **Статус:** ✅ Реализовано (не заглушка)

#### 5. Реализация FavoritesService с Prisma
- **Файл:** `backend/src/modules/favorites/favorites.service.ts`
- **Функции:** findAll, add, remove, isFavorite
- **Статус:** ✅ Реализовано (не заглушка)

#### 6. Реализация ChatService с Prisma
- **Файл:** `backend/src/modules/chat/chat.service.ts`
- **Функции:** getMessages, sendMessage, markAsRead, markAllAsRead, getUnreadCount
- **Статус:** ✅ Реализовано (не заглушка)

#### 7. Реализация DelaysService с Prisma
- **Файл:** `backend/src/modules/delays/delays.service.ts`
- **Функции:** findAll, findOne, create, getByTrip, getAllWithTrips
- **Особенность:** При создании задержки автоматически меняется статус рейса
- **Статус:** ✅ Реализовано (не заглушка)

#### 8. Реализация UsersService с Prisma
- **Файл:** `backend/src/modules/users/users.service.ts`
- **Функции:** findAll, findOne, create, update, remove, getDrivers, getOperators, getAdmins
- **Особенность:** Хеширование паролей с bcrypt
- **Статус:** ✅ Реализовано (не заглушка)

---

## Frontend (NextJS + PrimeReact)

### Выполненные задачи:

#### 1. Обновление API модуля
- **Файл:** `frontend/src/lib/api.ts`
- **Изменения:** Заменены stub-функции на реальные вызовы через Axios
- **Добавлено:** Интерцептор для автоматической авторизации (Bearer token)
- **Статус:** ✅ Реализовано

#### 2. Страница бронирования билетов
- **Файл:** `frontend/src/app/booking/page.tsx`
- **Функционал:**
  - Просмотр списка рейсов с информацией о маршруте
  - Выбор рейса и бронирование мест
  - Ввод данных пассажира
  - Расчёт стоимости
- **Статус:** ✅ Создано

#### 3. Страница оплаты
- **Файл:** `frontend/src/app/payment/page.tsx`
- **Функционал:**
  - Просмотр деталей бронирования
  - Выбор способа оплаты (карта, СБП, наличные)
  - Обработка платежа
  - Автоматическое подтверждение бронирования после оплаты
- **Статус:** ✅ Создано

#### 4. Дашборд администратора
- **Файл:** `frontend/src/app/admin/page.tsx`
- **Функционал:**
  - Статистика (бронирования, маршруты, пользователи)
  - Графики (Chart.js)
  - Быстрые ссылки на управление
  - Последние бронирования и рейсы
- **Статус:** ✅ Создано

#### 5. Страница электронного билета с QR
- **Файл:** `frontend/src/app/ticket/page.tsx`
- **Функционал:**
  - Генерация QR-кода (qrcode.react)
  - Отображение информации о билете
  - Инструкция по использованию
  - Печать билета
- **Статус:** ✅ Создано

### Установленные зависимости:
- `qrcode.react` - для генерации QR-кодов

---

## Подключение страниц Frontend к API (выполнено)

#### 1. Страница маршрутов (/routes)
- **Файл:** `frontend/src/app/routes/page.tsx`
- **Изменения:** Заменены mockRoutes на вызов routesApi.getAll()
- **Добавлено:** useState, useEffect для загрузки данных
- **Статус:** ✅ Подключено

#### 2. Страница расписания (/schedule)
- **Файл:** `frontend/src/app/schedule/page.tsx`
- **Изменения:** Заменены mockTrips на вызов tripsApi.getAll() + routesApi.getAll()
- **Добавлено:** Загрузка маршрутов для отображения направлений
- **Статус:** ✅ Подключено

#### 3. Страница билетов (/tickets)
- **Файл:** `frontend/src/app/tickets/page.tsx`
- **Изменения:** Заменены mockBookings на вызов bookingsApi.getByUser()
- **Добавлено:** Навигация на QR-код билета
- **Статус:** ✅ Подключено

#### 4. Страница избранного (/profile/favorites)
- **Файл:** `frontend/src/app/profile/favorites/page.tsx`
- **Изменения:** Заменены mockFavorites + mockRoutes на API вызовы
- **Функционал:** Добавление/удаление из избранного, бронирование
- **Статус:** ✅ Подключено

---

## Backend - Tickets модуль (создано)

#### 9. Реализация TicketsService с Prisma
- **Файл:** `backend/src/modules/tickets/tickets.service.ts`
- **Функции:** findAll, findOne, findByBooking, create, markAsUsed, validate
- **Особенность:** Генерация QR-кода (crypto random)
- **Статус:** ✅ Создано

#### 10. TicketsController
- **Файл:** `backend/src/modules/tickets/tickets.controller.ts`
- **Эндпоинты:**
  - GET /api/tickets - получить все билеты
  - GET /api/tickets/:id - получить билет по ID
  - GET /api/tickets/booking/:bookingId - билеты по брони
  - POST /api/tickets - создать билет
  - PUT /api/tickets/:id/used - отметить использованным
  - POST /api/tickets/:id/validate - валидация билета
- **Статус:** ✅ Создано

#### 11. TicketsModule
- **Файл:** `backend/src/modules/tickets/tickets.module.ts`
- **Статус:** ✅ Создано и зарегистрировано в AppModule

#### 12. ticketsApi
- **Файл:** `frontend/src/lib/api.ts`
- **Методы:** getAll, getById, getByBooking, create, validate, markAsUsed
- **Статус:** ✅ Добавлено

---

## Существующие проверенные страницы (не требующие изменений):

### Пользовательские:
- ✅ `frontend/src/app/page.tsx` - Главная страница (полностью реализована)
- ✅ `frontend/src/app/routes/page.tsx` - Выбор маршрутов (UI есть, работает с mock данными)
- ✅ `frontend/src/app/schedule/page.tsx` - Расписание рейсов (UI есть, работает с mock данными)
- ✅ `frontend/src/app/tickets/page.tsx` - Мои билеты (UI есть, работает с mock данными)
- ✅ `frontend/src/app/profile/favorites/page.tsx` - Избранное (UI есть, работает с mock данными)
- ✅ `frontend/src/app/profile/tickets/page.tsx` - Билеты профиля (UI есть, работает с mock данными)

### Административные:
- ✅ `frontend/src/app/admin/routes/page.tsx` - CRUD маршрутов (UI есть)
- ✅ `frontend/src/app/admin/users/page.tsx` - CRUD пользователей (UI есть)
- ✅ `frontend/src/app/admin/bookings/page.tsx` - Управление бронированиями (UI есть)

### Ролевые:
- ✅ `frontend/src/app/operator/page.tsx` - Дашборд оператора (UI есть, корректировка времени)
- ✅ `frontend/src/app/driver/page.tsx` - Водитель (просмотр рейсов + чат)

---

## Проверка заглушек Backend (завершено):

### API модули (ранее были заглушками):
- [x] RoutesService - ✅ Реализован
- [x] TripsService - ✅ Реализован
- [x] BookingsService - ✅ Реализован
- [x] PaymentsService - ✅ Реализован
- [x] FavoritesService - ✅ Реализован
- [x] ChatService - ✅ Реализован
- [x] DelaysService - ✅ Реализован
- [x] UsersService - ✅ Реализован

---

## Что ещё требуется сделать (не реализовано):

### Backend:
- [x] AuthService - ✅ Полностью реализован (JWT, регистрация, login, валидация)
- [x] Tickets модуль - для генерации электронных билетов с QR - ✅ Создан

### Frontend:
- [x] Подключение страниц routes, schedule, tickets к реальному API - ✅ Выполнено
- [ ] Дашборд оператора (расширенный)
- [ ] Страница trip с детализацией и бронированием

### Mobile:
- [ ] MAUI проект не инициализирован полностью

---

## Заметки:

1. Backend API работает на порту 3001 (изменено для избежания конфликта с frontend на 3000)
2. Frontend API endpoint настроен на `http://localhost:3001/api`
3. Все сервисы используют Prisma для работы с PostgreSQL
4. QR-код требует установленного пакета `qrcode.react`