# TODO: Диаграммы для диплома "АВ-Вокзал"

> Инструкции по созданию каждой диаграммы в MS Visio.
> Всего — **16 рисунков**.

---

## ✅ Рисунок 1 — Общая архитектура ИС «АВ-Вокзал» (трёхзвенная клиент-серверная архитектура)

**Шаблон Visio:** Блочная диаграмма (Block Diagram)

**Объекты:**

- **Клиентский слой (Client Tier):**
  - `Next.js Frontend` — веб-приложение (браузер)
  - `.NET MAUI Mobile App` — мобильное приложение (iOS/Android)
- **Серверный слой (Application Tier):**
  - `NestJS Backend API` — REST API, развёрнутый как serverless-функции на Vercel
  - Модули: `Auth`, `Trips`, `Bookings`, `Payments`, `Tickets`, `Chat`, `Delays`
- **Слой данных (Data Tier):**
  - `PostgreSQL` — реляционная БД (Vercel Postgres / Neon)
- **Внешние интеграции (External):**
  - `QR Code Generation` — генерация QR-билетов
- **Стрелки:**
  - Браузер/Мобилка → API (HTTPS)
  - API → PostgreSQL (Prisma ORM)
  - Мобильное приложение → API (REST)

---

## ✅ Рисунок 2 — Схема навигации веб-приложения

**Шаблон Visio:** Блок-схема (Flowchart) / Organizational Chart

**Объекты (страницы Next.js App Router):**

```
[Главная /] → [Маршруты /routes] → [Бронирование /booking] → [Оплата /payment] → [Билет /ticket]
[Главная /] → [Расписание /schedule]
[Главная /] → [Авторизация] → /auth/login, /auth/register
[Главная /] → [Выход /logout]
[Главная /] → [Профиль /profile/*]
  ├── /profile/tickets (Мои билеты)
  ├── /profile/favorites (Избранное)
  └── /profile/settings (Настройки)
[Главная /] → [Админ (только ADMIN)]
  ├── /admin (Дашборд)
  ├── /admin/routes (Маршруты)
  ├── /admin/users (Пользователи)
  ├── /admin/bookings (Бронирования)
  ├── /admin/buses (Автобусы)
  └── /admin/chats (История чатов)
[Главная /] → [Оператор (только OPERATOR)]
  ├── /operator (Дашборд + задержки)
  ├── /operator/chats (Чат-поддержка)
  └── /schedule (Расписание)
[Главная /] → [Водитель (только DRIVER)]
  ├── /driver (Мои рейсы + чат)
  └── /schedule (Расписание)
```

**Стрелки:** направленные линии, показывающие переходы между страницами.

---

## ✅ Рисунок 3 — Sequence Diagram: процесс бронирования билета

**Шаблон Visio:** UML Sequence Diagram

**Участники (Lifelines):**

1. `User` (brauser/клиент)
2. `Frontend` (Next.js)
3. `AuthGuard` (JWT middleware)
4. `BookingController`
5. `BookingService`
6. `TripService`
7. `Database` (PostgreSQL)

**Поток:**

1. User → Frontend: POST /bookings (seatNumbers, tripId)
2. Frontend → AuthGuard: проверка JWT-токена
3. AuthGuard → Frontend: 200 OK
4. Frontend → BookingController: create(data)
5. BookingController → BookingService: create(data)
6. BookingService → TripService: getTripWithBookings(tripId)
7. TripService → Database: findUnique(tripId) + bookings
8. Database → TripService: trip + bookings
9. BookingService: проверка доступности мест, расчёт цены
10. BookingService → Database: create booking + tickets (транзакция)
11. Database → BookingService: booking + tickets
12. BookingService → BookingController: booking
13. BookingController → Frontend: 201 Created (booking)
14. Frontend → User: перенаправление на /payment

---

## ✅ Рисунок 4 — Class Diagram: мобильное приложение (.NET MAUI)

**Шаблон Visio:** UML Class Diagram

**Классы (с полями):**

### ViewModels (наследуют `BaseViewModel`)

```
BaseViewModel
- IsBusy: bool
- ErrorMessage: string?
- ConnectionWarning: string?
- IsServerOnline: bool
- Title: string

MainViewModel : BaseViewModel
- SearchOrigin: string
- SearchDestination: string
- Routes: List<RouteModel>
- SelectedDate: DateTime
+ SearchRoutesCommand
+ SelectRouteCommand

BookingViewModel : BaseViewModel
- RouteId: string
- SelectedRoute: RouteModel?
- SelectedTrip: TripModel?
- Trips: List<TripModel>
- SeatCount: int
- PassengerName: string
- PassengerPhone: string
- PassengerEmail: string
- TotalPrice: decimal
- AvailableSeats: int
- IsBookingComplete: bool
- CreatedBooking: BookingModel?
- CurrentStep: int (0-3)
- StepHeader: string
- SeatItems: ObservableCollection<SeatItemModel>
+ GoNextStepCommand
+ GoPrevStepCommand
+ ToggleSeatCommand
+ CreateBookingCommand
+ GoToPaymentCommand

PaymentViewModel : BaseViewModel
- BookingId: string
- Booking: BookingModel?
- PaymentMethod: string
+ ProcessPaymentCommand

TicketViewModel : BaseViewModel
- BookingId: string
- Tickets: ObservableCollection<TicketModel>
- Booking: BookingModel?
- QrCodeImage: ImageSource?
- IsFromCache: bool
+ GoBackCommand

ProfileViewModel : BaseViewModel
- User: UserInfo?
- Bookings: ObservableCollection<BookingModel>
- Favorites: ObservableCollection<FavoriteModel>
- CachedTickets: ObservableCollection<TicketModel>
- IsEditingProfile: bool
+ SaveProfileCommand
+ LogoutCommand
+ RemoveFavoriteCommand

LoginViewModel : BaseViewModel
- Email: string
- Password: string
+ LoginCommand
+ GoToRegisterCommand

RegisterViewModel : BaseViewModel
- Email: string
- Password: string
- FirstName: string
- LastName: string
- Phone: string
+ RegisterCommand
+ GoToLoginCommand
```

### Services (интерфейсы и реализации)

```
<<interface>> IAuthService
+ CurrentUser: UserInfo?
+ IsAuthenticated: bool
+ LoginAsync(...)
+ RegisterAsync(...)
+ LogoutAsync()
+ GetProfileAsync()
+ event AuthStateChanged

<<interface>> IApiService — основные запросы к API
<<interface>> IApiHealthService — проверка доступности сервера
<<interface>> IQrCodeService — генерация QR-кода
<<interface>> IOfflineStorageService — кэширование билетов офлайн
```

### Models

```
UserInfo, RouteModel, TripModel, BookingModel, PaymentModel,
TicketModel, FavoriteModel, SeatItemModel, SeatMapResponse,
CreateBookingRequest, CreatePaymentRequest
```

### Views (страницы XAML)

```
MainPage, LoginPage, RegisterPage, BookingPage,
PaymentPage, TicketPage, ProfilePage
```

**Связи:**

- ViewModel → Service (зависимость через DI)
- View ←→ ViewModel (Data Binding)
- ViewModel → Model (использует)

---

## ✅ Рисунок 5 — Схема административной панели

**Шаблон Visio:** Блочная диаграмма / Organizational Chart

**Объекты:**

```
[Панель администратора]
  ├── [Дашборд] → статистика (бронирования, маршруты, пользователи)
  │     └── Круговая диаграмма статусов бронирований
  ├── [Управление маршрутами]
  │     └── CRUD: создание, редактирование, деактивация
  ├── [Управление пользователями]
  │     └── Просмотр, блокировка, смена роли
  ├── [Управление бронированиями]
  │     └── Просмотр, подтверждение, отмена, возврат
  ├── [Управление автобусами]
  │     └── CRUD: госномер, модель, кол-во мест
  ├── [Управление рейсами]
  │     └── Создание рейса (маршрут + автобус + водитель + время)
  ├── [История чатов]
  │     └── Просмотр закрытых чатов водитель-оператор
  └── [Расписание]
        └── Просмотр всех рейсов
```

**Связи:** иерархически подчинённые блоки (админ-панель → модули)

---

## ✅ Рисунок 6 — Activity Diagram: обработка задержек и обновление расписания

**Шаблон Visio:** UML Activity Diagram

**Дорожки (Swimlanes):**

1. `Operator (Web UI)` — оператор
2. `System (NestJS Backend)` — сервер
3. `Database` — БД

**Активности:**

```
[Оператор] → Получить список рейсов
[Система] → Загрузить рейсы + задержки из БД
[Оператор] → Выбрать рейс
[Оператор] → Указать: новое время отправления, новое время прибытия
[Оператор] → Подтвердить корректировку
[Система] → Валидация времени (прибытие > отправление)
  ├── (ошибка) → [Оператор] → Показать ошибку
  └── (успех) → [Система] → Обновить время рейса в БД
                [Система] → (опционально) Создать запись о задержке
                [База]     → UPDATE trips SET departureTime, arrivalTime
                [Система] → Отправить уведомление водителю (чат)
                [Оператор] → Показать обновлённое расписание
```

**Начальный узел:** Оператор открывает панель
**Конечный узел:** Расписание обновлено

---

## ✅ Рисунок 7 — ER-диаграмма (основные таблицы)

**Шаблон Visio:** Database Model Diagram

**Таблицы (6 основных):**

```
┌─────────────────────────────────────────────────────────┐
│  users          routes         trips                     │
│  ┌─────────┐   ┌──────────┐   ┌──────────────┐          │
│  │id (PK)  │←──│id (PK)   │   │id (PK)       │          │
│  │email    │   │name      │   │routeId (FK)──→routes.id │
│  │password │   │origin    │   │departureTime  │          │
│  │firstName│   │destination│   │arrivalTime    │          │
│  │lastName │   │price     │   │status         │          │
│  │role     │   │duration  │   │busId (FK) ───→buses.id │
│  │phone    │   └──────────┘   │driverId (FK)──→users.id │
│  │isActive │     ↑            │operatorId(FK)──→users.id│
│  └─────────┘     │            │totalSeats     │          │
│       ↑          │            └──────┬────────┘          │
│       │          │                   │                   │
│  ┌────┴──────┐   │    ┌──────────────┴─────────┐         │
│  │favorites  │   │    │ bookings                │         │
│  │userId(FK)─┤   │    │ id (PK)                 │         │
│  │routeId(FK)│───┘    │ userId (FK) ───────────→users.id │
│  └───────────┘        │ tripId (FK) ───────────→trips.id │
│                       │ seatNumbers: Int[]      │         │
│  ┌──────────┐         │ totalPrice: Decimal     │         │
│  │buses     │         │ status: BookingStatus   │         │
│  │id (PK)   │         └──────┬──────────────────┘         │
│  │plateNum  │                │                           │
│  │model     │         ┌──────┴──────────┐                │
│  │totalSeats│         │ tickets          │                │
│  │isActive  │         │ id (PK)          │                │
│  └──────────┘         │ bookingId (FK)──→bookings.id     │
│                       │ tripId (FK) ────→trips.id        │
│                       │ seatNumber: Int  │                │
│                       │ qrCode: Text     │                │
│                       │ isUsed: Boolean  │                │
│                       └──────────────────┘                │
└─────────────────────────────────────────────────────────┘
```

**Связи:**

- `Route` 1 → N `Trip`
- `Trip` 1 → N `Booking`
- `Booking` 1 → N `Ticket`
- `Booking` N → 1 `User`
- `Trip` N → 1 `User` (driver/operator)
- `Trip` N → 1 `Bus`
- `User` 1 → N `Favorite`
- `Route` 1 → N `Favorite`
- `Booking` 1 → 1 `Payment`

---

## ✅ Рисунок 8 — Архитектура паттерна MVVM в контексте мобильного приложения

**Шаблон Visio:** Блочная диаграмма / UML Package Diagram

**Три слоя:**

```
┌─────────────────────────────────────────┐
│  VIEW (XAML)                            │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │ MainPage     │  │ BookingPage     │  │
│  │ LoginPage    │  │ PaymentPage     │  │
│  │ RegisterPage │  │ TicketPage      │  │
│  │ ProfilePage  │  │                 │  │
│  └──────┬───────┘  └────────┬────────┘  │
│         │ Data Binding      │            │
│         ▼                   ▼            │
│  ┌────────────────────────────────────┐  │
│  │  VIEWMODEL                         │  │
│  │  MainViewModel  BookingViewModel   │  │
│  │  LoginViewModel ProfileViewModel   │  │
│  │  PaymentViewModel TicketViewModel  │  │
│  │  BaseViewModel (ObservableObject)  │  │
│  └──────┬─────────────────────────────┘  │
│         │ Calls                          │
│         ▼                                │
│  ┌────────────────────────────────────┐  │
│  │  MODEL / SERVICE                   │  │
│  │  IApiService       → ApiService    │  │
│  │  IAuthService      → AuthService   │  │
│  │  IOfflineStorage   → OfflineStore  │  │
│  │  IQrCodeService    → QrCodeService │  │
│  │  RouteModel, TripModel, ...        │  │
│  └──────┬─────────────────────────────┘  │
│         │ HTTP                           │
│         ▼                                │
│  [NestJS REST API]                       │
└─────────────────────────────────────────┘
```

**Стрелки:** View → (Data Binding) → ViewModel → Service → API
**Пояснения подписями:** Data Binding (двунаправленная связь), Command (релейные команды), INotifyPropertyChanged

---

## ✅ Рисунок 9 — Архитектура развёртывания на Vercel

**Шаблон Visio:** UML Deployment Diagram / Cloud Diagram

**Ноды (Nodes):**

- **Vercel Platform:**
  - `Vercel Edge Network (CDN)` — глобальная доставка статики
  - `Next.js Frontend` — SSR/SSG на Vercel
  - `NestJS Serverless Functions` — API (serverless lambda на Node.js)
- **Vercel Postgres (Neon):**
  - `PostgreSQL Database` — основная БД
- **Внешние системы:**
  - `GitHub Repository` — исходный код (CI/CD через git push)
  - `Browser` — пользователи веб-версии
  - `.NET MAUI Mobile App` — мобильное приложение
- `Prisma ORM` — связка Serverless Functions ↔ PostgreSQL

**Протоколы/стереотипы:**

- HTTPS между браузером и Vercel Edge
- HTTPS между мобильным приложением и API
- TLS/SSL — всё соединение
- CI/CD: GitHub → Vercel (автоматический деплой)

---

## ✅ Рисунок 10 — Use Case Diagram

**Шаблон Visio:** UML Use Case Diagram

**Актёры:**

1. `Гость (Unauthenticated User)`
2. `Зарегистрированный пользователь (User)`
3. `Администратор (Admin)`
4. `Оператор (Operator)`
5. `Водитель (Driver)`

**Use Cases:**

- Для всех: `Просмотр маршрутов`, `Просмотр расписания`
- Для гостя: `Регистрация`, `Авторизация`
- Для пользователя: `Поиск маршрутов`, `Бронирование билета`, `Оплата билета`, `Просмотр электронного билета`, `Добавление в избранное`, `Просмотр профиля`, `Редактирование профиля`, `Просмотр истории поездок`
- Для администратора: `Управление пользователями`, `Управление маршрутами`, `Управление бронированиями`, `Управление автобусами`, `Управление рейсами`, `Просмотр статистики`, `Просмотр истории чатов`
- Для оператора: `Мониторинг рейсов`, `Создание рейса`, `Корректировка расписания`, `Регистрация задержки`, `Чат с водителем`, `Просмотр расписания`
- Для водителя: `Просмотр моих рейсов`, `Чат с оператором`

**Отношения:**

- Admin extends (расширяет) все use case оператора
- User extends (расширяет) Guest
- Include: «Бронирование» включает «Авторизация» (если не авторизован)
- Include: «Покупка билета» включает «Оплата»

---

## ✅ Рисунок 11 — Схема ролевой модели доступа

**Шаблон Visio:** Блочная диаграмма / Матрица ролей

**Объекты:**

```
                    ┌──────────────────────────────────────────┐
                    │          РОЛЕВАЯ МОДЕЛЬ                   │
                    ├──────────┬─────────┬──────────┬───────────┤
                    │   Гость  │  USER   │ OPERATOR │  DRIVER   │
                    ├──────────┼─────────┼──────────┼───────────┤
├───────────────────┼──────────┼─────────┼──────────┼───────────┤
│ Веб-сайт (публич.)│   ✅     │    ✅    │    ✅     │    ✅      │
│ Личный кабинет    │   ❌     │    ✅    │    ✅     │    ✅      │
│ Панель оператора  │   ❌     │    ❌    │    ✅     │    ❌      │
│ Панель водителя   │   ❌     │    ❌    │    ❌     │    ✅      │
│ Панель админа     │   ❌     │    ❌    │    ❌     │    ❌      │
│ Админ-API (CRUD)  │   ❌     │    ❌    │    ❌     │    ❌      │
├───────────────────┼──────────┼─────────┼──────────┼───────────┤
│ ADMIN FULL ACCESS │   ✅     │    ✅    │    ✅     │    ✅      │
└───────────────────┴──────────┴─────────┴──────────┴───────────┘
```

**Дополнительно:** блок-схема проверки в middleware (proxy.ts):

- Запрос → Проверка cookies (access_token) → Проверка роли → Доступ разрешён/редирект

---

## ✅ Рисунок 12 — Sequence Diagram: аутентификация

**Шаблон Visio:** UML Sequence Diagram

**Участники (Lifelines):**

1. `User` (браузер/мобилка)
2. `Frontend` (Next.js / MAUI)
3. `AuthController`
4. `AuthService`
5. `JwtService`
6. `Database`

**Поток для регистрации:**

1. User → Frontend: POST /auth/register (email, password, firstName, lastName)
2. Frontend → AuthController: register(dto)
3. AuthController → AuthService: register(data)
4. AuthService → Database: findUnique(email) — проверка дубликата
5. Database → AuthService: null (не найден)
6. AuthService → AuthService: bcrypt.hash(password, 10)
7. AuthService → Database: create(user)
8. Database → AuthService: user
9. AuthService → JwtService: sign({sub, email, role})
10. JwtService → AuthService: access_token (JWT)
11. AuthService → AuthController: {access_token, user}
12. AuthController → Frontend: 201 Created
13. Frontend: сохраняет token в localStorage + cookies
14. Frontend → User: редирект на главную

**Поток для входа (login):**

- Аналогично, но проверка bcrypt.compare + проверка isActive

**Поток для валидации токена:**

- Frontend → AuthController: GET /auth/validate (Authorization: Bearer)
- AuthService: jwtService.verify(token) + findUnique(user)

---

## ✅ Рисунок 13 — Модель данных чата (Class Diagram)

**Шаблон Visio:** UML Class Diagram

**Классы:**

```
Chat
  - id: String (UUID, PK)
  - driverId: String (FK → users.id)
  - operatorId: String? (FK → users.id)
  - status: ChatStatus { WAITING, ACTIVE, CLOSED }
  - lastHeartbeatAt: DateTime?
  - closedAt: DateTime?
  - createdAt: DateTime
  - updatedAt: DateTime
  ---
  + driver: User (1 → 1)
  + operator: User? (1 → 1)
  + messages: List<Message> (1 → N)

Message
  - id: String (UUID, PK)
  - chatId: String (FK → chats.id, CASCADE)
  - senderId: String (FK → users.id)
  - senderRole: MessageSenderRole { DRIVER, OPERATOR, ADMIN }
  - text: String (Text)
  - createdAt: DateTime
  ---
  + chat: Chat (N → 1)
  + sender: User (N → 1)

User (только поля, связанные с чатом)
  - id: String (PK)
  - firstName: String
  - lastName: String
  - email: String
  - role: UserRole
  ---
  + chatsAsDriver: List<Chat>
  + chatsAsOperator: List<Chat>
  + messages: List<Message>
```

**Дополнительно:** показать enum ChatStatus и MessageSenderRole

---

## ✅ Рисунок 14 — State Machine Diagram: состояния рейса (Trip)

**Шаблон Visio:** UML State Machine Diagram

**Состояния:**

```
[SCHEDULED] ──(отправление)──→ [IN_PROGRESS]
    │                              │
    │(задержка)                    │(прибытие)
    ▼                              ▼
[DELAYED] ──(отправление)──→ [COMPLETED]
    │
    │(отмена)
    ▼
[CANCELLED]
```

**Переходы:**

- SCHEDULED → IN_PROGRESS: рейс начался
- SCHEDULED → DELAYED: оператор зарегистрировал задержку
- DELAYED → IN_PROGRESS: рейс начался после задержки
- SCHEDULED → CANCELLED: рейс отменён
- DELAYED → CANCELLED: рейс отменён после задержки
- IN_PROGRESS → COMPLETED: рейс завершён
- IN_PROGRESS → CANCELLED: рейс прерван
- (любое) → DELAYED: создание записи Delay + изменение статуса

**Начальное состояние:** SCHEDULED
**Конечные состояния:** COMPLETED, CANCELLED

---

## ✅ Рисунок 15 — Sequence Diagram: бронирование + оплата

**Шаблон Visio:** UML Sequence Diagram

**Участники:**

1. `User`
2. `Frontend (Web/Mobile)`
3. `BookingController`
4. `BookingService`
5. `PaymentController`
6. `PaymentService`
7. `Database`

**Поток:**

1. User → Frontend: выбор рейса, мест (seatNumbers)
2. Frontend → BookingController: POST /bookings (userId, tripId, seatNumbers)
3. BookingController → BookingService: create(data)
4. BookingService → Database: валидация + create booking + tickets (1 транзакция)
5. Database → BookingService: booking (PENDING) + tickets
6. BookingService → BookingController: booking
7. BookingController → Frontend: 201 Created
8. Frontend → User: отобразить страницу оплаты
9. User → Frontend: подтверждение оплаты (paymentMethod)
10. Frontend → PaymentController: POST /payments (bookingId, amount)
11. PaymentController → PaymentService: create(data) → PENDING
12. PaymentService → Database: create payment
13. Database → PaymentService: payment (PENDING)
14. PaymentService → PaymentService: process(id) — генерация transactionId
15. PaymentService → Database: update payment → COMPLETED
16. PaymentService → Database: update booking → CONFIRMED
17. PaymentService → PaymentController: payment
18. PaymentController → Frontend: 200 OK
19. Frontend → User: отобразить электронный билет с QR-кодом

---

## ✅ Рисунок 16 — Полная ER-диаграмма (все модели БД)

**Шаблон Visio:** Database Model Diagram

**Все 11 таблиц + 7 enum'ов:**

### Таблицы (с полными полями)

```
users
  id (PK, UUID)
  email (UQ)
  password (hashed)
  firstName
  lastName
  phone?
  role: UserRole
  isActive
  createdAt
  updatedAt

routes
  id (PK, UUID)
  name
  description?
  origin
  destination
  distance? (km)
  duration? (min)
  price (Decimal 10,2)
  isActive
  createdAt
  updatedAt

buses
  id (PK, UUID)
  plateNumber (UQ)
  model?
  totalSeats (default 40)
  isActive
  createdAt
  updatedAt

trips
  id (PK, UUID)
  routeId (FK → routes.id)
  departureTime
  arrivalTime
  status: TripStatus
  busNumber? (legacy)
  busId? (FK → buses.id)
  driverId? (FK → users.id)
  operatorId? (FK → users.id)
  totalSeats (default 40)
  createdAt
  updatedAt

bookings
  id (PK, UUID)
  userId (FK → users.id)
  tripId (FK → trips.id)
  seats (Int)
  seatNumbers (Int[])
  totalPrice (Decimal 10,2)
  status: BookingStatus
  passengerName?
  passengerPhone?
  passengerEmail?
  createdAt
  updatedAt

tickets
  id (PK, UUID)
  bookingId (FK → bookings.id)
  tripId (FK → trips.id)
  seatNumber (Int)
  qrCode? (Text)
  isUsed (bool)
  usedAt?
  createdAt

payments
  id (PK, UUID)
  bookingId (FK → bookings.id, UQ)
  amount (Decimal 10,2)
  status: PaymentStatus
  paymentMethod?
  transactionId?
  paidAt?
  createdAt
  updatedAt

favorites
  id (PK, UUID)
  userId (FK → users.id)
  routeId (FK → routes.id)
  createdAt
  UQ: [userId, routeId]

delays
  id (PK, UUID)
  tripId (FK → trips.id)
  reason?
  delayMinutes (Int)
  createdAt
  updatedAt

chats
  id (PK, UUID)
  driverId (FK → users.id)
  operatorId? (FK → users.id)
  status: ChatStatus
  lastHeartbeatAt?
  closedAt?
  createdAt
  updatedAt

messages
  id (PK, UUID)
  chatId (FK → chats.id, CASCADE)
  senderId (FK → users.id)
  senderRole: MessageSenderRole
  text (Text)
  createdAt
```

### Enums (показать как стереотипы/заметки)

```
UserRole = USER | ADMIN | DRIVER | OPERATOR
BookingStatus = PENDING | CONFIRMED | CANCELLED | COMPLETED
PaymentStatus = PENDING | COMPLETED | FAILED | REFUNDED
TripStatus = SCHEDULED | IN_PROGRESS | COMPLETED | CANCELLED | DELAYED
ChatStatus = WAITING | ACTIVE | CLOSED
MessageSenderRole = DRIVER | OPERATOR | ADMIN
```

### Связи (основные)

- `Route` 1 ─── N `Trip`
- `Bus` 1 ─── N `Trip`
- `Trip` N ─── 1 `User` (driver)
- `Trip` N ─── 1 `User` (operator)
- `Trip` 1 ─── N `Booking`
- `Trip` 1 ─── N `Delay`
- `Trip` 1 ─── N `Ticket`
- `Booking` N ─── 1 `User`
- `Booking` 1 ─── 1 `Payment`
- `Booking` 1 ─── N `Ticket`
- `User` 1 ─── N `Favorite`
- `Route` 1 ─── N `Favorite`
- `Chat` N ─── 1 `User` (driver)
- `Chat` N ─── 1 `User` (operator)
- `Chat` 1 ─── N `Message` (CASCADE)
- `User` 1 ─── N `Message`

---

## Примечания по стилю Visio

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
   - Именование файлов: `Рисунок 1 - Общая архитектура` (как в списке)

4. **Размер шрифта:** 10-12pt для подписей, 14-16pt для заголовков

5. **Для Visio:** используй разделы
   - **Блочная диаграмма** → Базовые фигуры (прямоугольники, стрелки)
   - **UML** → UML-шаблоны (Sequence, Class, Use Case, Activity, State Machine)
   - **Database** → Шаблон Database Model Diagram (Entity Relationship)
   - **Cloud** → Azure / Cloud stencils (для Vercel deployment)
