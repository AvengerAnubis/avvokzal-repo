import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

// Mock PrismaService for e2e tests
const mockPrismaProvider = {
  provide: PrismaService,
  useValue: {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    route: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    trip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    favorite: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    chatMessage: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    delay: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    ticket: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/auth/register (POST) - should register a new user', () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
    });

    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('access_token');
        expect(res.body.user).toHaveProperty('email', 'test@test.com');
      });
  });

  it('/api/auth/login (POST) - should return 401 for invalid credentials', () => {
    prisma.user.findUnique.mockResolvedValue(null);

    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrong' })
      .expect(401);
  });
});

describe('RoutesController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/routes (GET) - should return all routes', () => {
    const mockRoutes = [
      { id: '1', name: 'Route A', origin: 'City A', destination: 'City B', price: 1000, isActive: true },
    ];
    prisma.route.findMany.mockResolvedValue(mockRoutes);

    return request(app.getHttpServer())
      .get('/api/routes')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty('name', 'Route A');
      });
  });

  it('/api/routes/search (GET) - should search routes', () => {
    const mockRoutes = [
      { id: '1', name: 'Москва - Санкт-Петербург', origin: 'Москва', destination: 'Санкт-Петербург' },
    ];
    prisma.route.findMany.mockResolvedValue(mockRoutes);

    return request(app.getHttpServer())
      .get('/api/routes/search?origin=Москва&destination=Санкт')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/routes/:id (GET) - should return a single route', () => {
    const mockRoute = { id: '1', name: 'Route A', trips: [] };
    prisma.route.findUnique.mockResolvedValue(mockRoute);

    return request(app.getHttpServer())
      .get('/api/routes/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', '1');
      });
  });
});

describe('TripsController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/trips (GET) - should return all trips', () => {
    const mockTrips = [{ id: '1', routeId: 'r1', status: 'SCHEDULED', route: {}, driver: {} }];
    prisma.trip.findMany.mockResolvedValue(mockTrips);

    return request(app.getHttpServer())
      .get('/api/trips')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/trips/delayed (GET) - should return delayed trips', () => {
    const mockDelayed = [{ id: '1', status: 'DELAYED', route: {}, delays: [] }];
    prisma.trip.findMany.mockResolvedValue(mockDelayed);

    return request(app.getHttpServer())
      .get('/api/trips/delayed')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/trips/:id/seats (GET) - should return available seats', () => {
    prisma.trip.findUnique.mockResolvedValue({
      id: '1',
      bookings: [{ seats: 5 }, { seats: 3 }],
    });

    return request(app.getHttpServer())
      .get('/api/trips/1/seats')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('totalSeats', 40);
        expect(res.body).toHaveProperty('bookedSeats', 8);
        expect(res.body).toHaveProperty('availableSeats', 32);
      });
  });
});

describe('BookingsController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/bookings (GET) - should return all bookings', () => {
    const mockBookings = [{ id: '1', trip: {}, user: {}, payment: {} }];
    prisma.booking.findMany.mockResolvedValue(mockBookings);

    return request(app.getHttpServer())
      .get('/api/bookings')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/bookings/user/:userId (GET) - should return user bookings', () => {
    const mockBookings = [{ id: '1', userId: 'u1', trip: {}, payment: {}, tickets: [] }];
    prisma.booking.findMany.mockResolvedValue(mockBookings);

    return request(app.getHttpServer())
      .get('/api/bookings/user/u1')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/payments (GET) - should return all payments', () => {
    const mockPayments = [{ id: '1', booking: {} }];
    prisma.payment.findMany.mockResolvedValue(mockPayments);

    return request(app.getHttpServer())
      .get('/api/payments')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});

describe('FavoritesController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/favorites?userId=u1 (GET) - should return user favorites', () => {
    const mockFavorites = [{ id: '1', userId: 'u1', routeId: 'r1', route: {} }];
    prisma.favorite.findMany.mockResolvedValue(mockFavorites);

    return request(app.getHttpServer())
      .get('/api/favorites?userId=u1')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});

describe('ChatController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/chat/driver/:driverId (GET) - should return chat messages', () => {
    const mockMessages = [{ id: '1', driverId: 'd1', content: 'Hello', driver: {} }];
    prisma.chatMessage.findMany.mockResolvedValue(mockMessages);

    return request(app.getHttpServer())
      .get('/api/chat/driver/d1')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/chat/driver/:driverId/unread (GET) - should return unread count', () => {
    prisma.chatMessage.count.mockResolvedValue(3);

    return request(app.getHttpServer())
      .get('/api/chat/driver/d1/unread')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('count', 3);
      });
  });
});

describe('DelaysController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/delays (GET) - should return all delays', () => {
    const mockDelays = [{ id: '1', trip: {} }];
    prisma.delay.findMany.mockResolvedValue(mockDelays);

    return request(app.getHttpServer())
      .get('/api/delays')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});

describe('TicketsController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/tickets (GET) - should return all tickets', () => {
    const mockTickets = [{ id: '1', booking: {}, trip: {} }];
    prisma.ticket.findMany.mockResolvedValue(mockTickets);

    return request(app.getHttpServer())
      .get('/api/tickets')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/tickets/:id/validate (POST) - should validate a ticket', () => {
    prisma.ticket.findUnique.mockResolvedValue({ id: '1', isUsed: false, trip: {} });

    return request(app.getHttpServer())
      .post('/api/tickets/1/validate')
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('valid', true);
      });
  });
});

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaProvider.useValue)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = moduleFixture.get(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/users (GET) - should return all users', () => {
    const mockUsers = [{ id: '1', email: 'test@test.com', role: 'USER', isActive: true }];
    prisma.user.findMany.mockResolvedValue(mockUsers);

    return request(app.getHttpServer())
      .get('/api/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/users/drivers/list (GET) - should return drivers', () => {
    const mockDrivers = [{ id: '1', email: 'driver@test.com', firstName: 'Driver' }];
    prisma.user.findMany.mockResolvedValue(mockDrivers);

    return request(app.getHttpServer())
      .get('/api/users/drivers/list')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/users/operators/list (GET) - should return operators', () => {
    const mockOperators = [{ id: '1', email: 'operator@test.com', firstName: 'Operator' }];
    prisma.user.findMany.mockResolvedValue(mockOperators);

    return request(app.getHttpServer())
      .get('/api/users/operators/list')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/api/users/:id (GET) - should return a single user', () => {
    const mockUser = { id: '1', email: 'test@test.com', role: 'USER', isActive: true };
    prisma.user.findUnique.mockResolvedValue(mockUser);

    return request(app.getHttpServer())
      .get('/api/users/1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', '1');
      });
  });
});
