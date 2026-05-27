# TODO: Диаграммы для диплома "АВ-Вокзал"

> Статус: ❌ — не сделано, ✅ — сделано
> Всего — **16 рисунков** + 2 макета.

---

# ❌ НЕ ВЫПОЛНЕНЫ

---

## ❌ Рисунок 16 — Полная ER-диаграмма (все модели БД)

**Шаблон Visio:** Database Model Diagram

**Все 11 таблиц + 7 enum'ов:**

```
users
  id (PK, UUID), email (UQ), password (hashed), firstName, lastName,
  phone?, role: UserRole, isActive, createdAt, updatedAt

routes
  id (PK, UUID), name, description?, origin, destination,
  distance? (km), duration? (min), price (Decimal 10,2),
  isActive, createdAt, updatedAt

buses
  id (PK, UUID), plateNumber (UQ), model?, totalSeats (default 40),
  isActive, createdAt, updatedAt

trips
  id (PK, UUID), routeId (FK → routes.id), departureTime, arrivalTime,
  status: TripStatus, busNumber?, busId? (FK → buses.id),
  driverId? (FK → users.id), operatorId? (FK → users.id),
  totalSeats (default 40), createdAt, updatedAt

bookings
  id (PK, UUID), userId (FK → users.id), tripId (FK → trips.id),
  seats (Int), seatNumbers (Int[]), totalPrice (Decimal 10,2),
  status: BookingStatus, passengerName?, passengerPhone?,
  passengerEmail?, createdAt, updatedAt

tickets
  id (PK, UUID), bookingId (FK → bookings.id), tripId (FK → trips.id),
  seatNumber (Int), qrCode? (Text), isUsed (bool), usedAt?, createdAt

payments
  id (PK, UUID), bookingId (FK → bookings.id, UQ), amount (Decimal 10,2),
  status: PaymentStatus, paymentMethod?, transactionId?,
  paidAt?, createdAt, updatedAt

favorites
  id (PK, UUID), userId (FK → users.id), routeId (FK → routes.id),
  createdAt, UQ: [userId, routeId]

delays
  id (PK, UUID), tripId (FK → trips.id), reason?, delayMinutes (Int),
  createdAt, updatedAt

chats
  id (PK, UUID), driverId (FK → users.id), operatorId? (FK → users.id),
  status: ChatStatus, lastHeartbeatAt?, closedAt?, createdAt, updatedAt

messages
  id (PK, UUID), chatId (FK → chats.id, CASCADE),
  senderId (FK → users.id), senderRole: MessageSenderRole,
  text (Text), createdAt
```

**Enums:**
```
UserRole = USER | ADMIN | DRIVER | OPERATOR
BookingStatus = PENDING | CONFIRMED | CANCELLED | COMPLETED
PaymentStatus = PENDING | COMPLETED | FAILED | REFUNDED
TripStatus = SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED | DELAYED
ChatStatus = WAITING | ACTIVE | CLOSED
MessageSenderRole = DRIVER | OPERATOR | ADMIN
```

**Связи:**
- `Route` 1 ─── N `Trip`
- `Bus` 1 ─── N `Trip`
- `Trip` N ─── 1 `User` (driver/operator)
- `Trip` 1 ─── N `Booking`, `Delay`, `Ticket`
- `Booking` N ─── 1 `User`
- `Booking` 1 ─── 1 `Payment`
- `Booking` 1 ─── N `Ticket`
- `User` 1 ─── N `Favorite`
- `Route` 1 ─── N `Favorite`
- `Chat` N ─── 1 `User` (driver/operator)
- `Chat` 1 ─── N `Message` (CASCADE)
- `User` 1 ─── N `Message`

---

---

# ✅ ВЫПОЛНЕНЫ

---

## ✅ Рисунок 1 — Общая архитектура ИС «АВ-Вокзал» (трёхзвенная клиент-серверная)

**Файл:** `рисунок_1_Block.vsdx`
**Шаблон Visio:** Блочная диаграмма (Block Diagram)

**Объекты:**
- Клиентский слой: `Next.js Frontend`, `.NET MAUI Mobile App`
- Серверный слой: `NestJS Backend API` + модули (Auth, Trips, Bookings, Payments, Tickets, Chat, Delays)
- Слой данных: `PostgreSQL`
- Внешние: `QR Code Generation`
- Стрелки: Браузер/Мобилка → API (HTTPS), API → PostgreSQL (Prisma ORM)

---

## ✅ Рисунок 2 — Схема навигации веб-приложения

**Файл:** `рисунок_2.vsdx`
**Шаблон Visio:** Блок-схема (Flowchart)

**Объекты:** Главная → Маршруты → Бронирование → Оплата → Билет; Расписание; Авторизация; Профиль (билеты, избранное, настройки); Админ (дашборд, маршруты, пользователи, бронирования, автобусы, чаты); Оператор (дашборд, чаты, расписание); Водитель (рейсы, чат, расписание).

---

## ✅ Рисунок 3 — Sequence Diagram: процесс бронирования билета

**Файл:** `рисунок_3_Sequence.vsdx`
**Шаблон Visio:** UML Sequence Diagram

**Участники:** User, Frontend, AuthGuard, BookingController, BookingService, TripService, Database

**Поток:** POST /bookings → JWT-проверка → валидация мест → create booking + tickets (транзакция) → 201 → редирект на /payment

---

## ✅ Рисунок 4 — Class Diagram: мобильное приложение (.NET MAUI)

**Файл:** `рисунок_4_Class.vsdx`
**Шаблон Visio:** UML Class Diagram

**ViewModels:** BaseViewModel, MainViewModel, BookingViewModel, PaymentViewModel, TicketViewModel, ProfileViewModel, LoginViewModel, RegisterViewModel
**Services:** IAuthService, IApiService, IApiHealthService, IQrCodeService, IOfflineStorageService
**Models:** RouteModel, TripModel, BookingModel, PaymentModel, TicketModel, FavoriteModel, SeatItemModel и др.
**Views:** MainPage, LoginPage, RegisterPage, BookingPage, PaymentPage, TicketPage, ProfilePage

---

## ✅ Рисунок 5 — Схема административной панели

**Файл:** `рисунок_5_Block.vsdx`
**Шаблон Visio:** Блочная диаграмма (Block Diagram)

**Разделы:** Дашборд, Маршруты, Пользователи, Бронирования, Автобусы, История чатов, Расписание

---

## ✅ Рисунок 6 — Activity Diagram: обработка задержек

**Файл:** `рисунок_6_Activity.vsdx`
**Шаблон Visio:** UML Activity Diagram (Swimlanes)

**Дорожки:** Operator (Web UI) | System (NestJS) | Database

**Поток:** Загрузка рейсов → Выбор рейса → Указание нового времени → Валидация → Обновление БД → Уведомление водителя

---

## ✅ Рисунок 7 — ER-диаграмма (основные таблицы)

**Файл:** `рисунок_7_ER.vsdx`
**Шаблон Visio:** Database Model Diagram

**Таблицы (6):** users, routes, trips, buses, bookings, tickets, favorites, payments
**Связи:** Route→Trip, Trip→Booking, Booking→Ticket/Payment/User, User→Favorite, Trip→Bus/User

---

## ✅ Рисунок 8 — Архитектура паттерна MVVM

**Файл:** `рисунок_8.vsdx`
**Шаблон Visio:** Блочная диаграмма / UML Package Diagram

**Три слоя:** VIEW (XAML) → Data Binding → VIEWMODEL → Calls → MODEL / SERVICE → HTTP → NestJS REST API

---

## ✅ Рисунок 9 — Архитектура развёртывания на Vercel

**Файл:** `рисунок_9_Deployment.vsdx`
**Шаблон Visio:** UML Deployment Diagram

**Ноды:** Vercel Platform (CDN, Next.js, NestJS, Prisma) | PostgreSQL (Neon) | GitHub | Browser | MAUI App
**Протоколы:** HTTPS, TLS, CI/CD

---

## ✅ Рисунок 10 — Use Case Diagram

**Файл:** `рисунок_10_UseCase.vsdx`
**Шаблон Visio:** UML Use Case Diagram

**Актёры:** Гость, User, Администратор, Оператор, Водитель
**Use Cases:** Просмотр маршрутов/расписания, Регистрация/Авторизация, Бронирование/Оплата, Управление (CRUD), Чат, Статистика

---

## ✅ Рисунок 11 — Схема ролевой модели доступа

**Выполнено:** таблица в MS Word
**Черновик:** `рисунок_11.xlsx`

**Таблица:** роли (Гость, User, Водитель, Оператор, Админ) × модули (сайт, личный кабинет, панели, управление)

---

## ✅ Рисунок 12 — Sequence Diagram: аутентификация

**Файл:** `рисунок_12_Sequence.vsdx`
**Шаблон Visio:** UML Sequence Diagram

**Участники:** User, Frontend, AuthController, AuthService, JwtService, Database
**Потоки:** Регистрация (hash + create + sign JWT), Вход (bcrypt.compare), Валидация токена

---

## ✅ Рисунок 13 — Модель данных чата (Class Diagram)

**Файл:** `рисунок_13_Class.vsdx`
**Шаблон Visio:** UML Class Diagram

**Классы:** Chat, Message, User (связь с чатами)
**Enums:** ChatStatus, MessageSenderRole

---

## ✅ Рисунок 14 — State Machine Diagram: состояния рейса

**Файл:** `рисунок_14_StateMachine.vsdx`
**Шаблон Visio:** UML State Machine Diagram

**Состояния:** SCHEDULED → IN_PROGRESS → COMPLETED, SCHEDULED/DELAYED → CANCELLED
**Начальное:** SCHEDULED
**Конечные:** COMPLETED, CANCELLED

---

## ✅ Рисунок 15 — Sequence Diagram: бронирование + оплата

**Файл:** `рисунок_15_Sequence.vsdx`
**Шаблон Visio:** UML Sequence Diagram

**Участники:** User, Frontend, BookingController, BookingService, PaymentController, PaymentService, Database
**Поток:** Выбор рейса/мест → POST /bookings (PENDING) → POST /payments → process → COMPLETED + CONFIRMED → билет с QR

---

## ✅ Макет мобильного приложения

**Файл:** `рисунок_макет_мобильного_приложения.vsdx`

---

## ✅ Макет главной страницы веб-приложения

**Файл:** `рисунок_макет_главной_страницы.vsdx`

---

# Примечания по стилю Visio

1. **Цветовая схема:**
   - Entities (сущности): голубой фон
   - Перечисления (enum): светло-жёлтый
   - Акторы (UML): human stick figure
   - Серверные компоненты: зелёный
   - Клиентские: синий

2. **Шрифты:** русский текст везде

3. **Форматы экспорта:**
   - PNG (300 dpi) для вставки в диплом
   - Сохранить .vsdx для последующего редактирования

4. **Для Visio:**
   - **Блочная диаграмма** → Базовые фигуры (прямоугольники, стрелки)
   - **UML** → UML-шаблоны (Sequence, Class, Use Case, Activity, State Machine)
   - **Database** → Database Model Diagram (Entity Relationship)
