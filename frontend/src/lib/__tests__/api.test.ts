import axios from 'axios';

// Mock axios at module level
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => mockAxiosInstance),
  },
}));

// Re-import to get the mocked module
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authApi', () => {
    it('login should POST to /auth/login', async () => {
      const { authApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { access_token: 'token123', user: { id: '1' } } });

      const result = await authApi.login('test@test.com', 'password');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'password' });
      expect(result.data).toHaveProperty('access_token', 'token123');
    });

    it('register should POST to /auth/register', async () => {
      const { authApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { access_token: 'token123', user: { id: '1' } } });

      await authApi.register({ email: 'test@test.com', password: 'password', firstName: 'John', lastName: 'Doe' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@test.com', password: 'password', firstName: 'John', lastName: 'Doe',
      });
    });

    it('validate should GET /auth/validate', async () => {
      const { authApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: { valid: true } });

      await authApi.validate('token123');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/auth/validate');
    });
  });

  describe('routesApi', () => {
    it('getAll should GET /routes', async () => {
      const { routesApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await routesApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/routes');
    });

    it('getById should GET /routes/:id', async () => {
      const { routesApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: { id: '1' } });

      await routesApi.getById('route-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/routes/route-1');
    });

    it('search should GET /routes/search with params', async () => {
      const { routesApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await routesApi.search('Moscow', 'Kazan');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/routes/search', { params: { origin: 'Moscow', destination: 'Kazan' } });
    });

    it('create should POST /routes', async () => {
      const { routesApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: '1' } });

      await routesApi.create({ name: 'New Route' });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/routes', { name: 'New Route' });
    });

    it('update should PUT /routes/:id', async () => {
      const { routesApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { id: '1' } });

      await routesApi.update('route-1', { name: 'Updated' });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/routes/route-1', { name: 'Updated' });
    });

    it('delete should DELETE /routes/:id', async () => {
      const { routesApi } = require('@/lib/api');
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await routesApi.delete('route-1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/routes/route-1');
    });
  });

  describe('tripsApi', () => {
    it('getAll should GET /trips', async () => {
      const { tripsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await tripsApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trips', { params: undefined });
    });

    it('getAll with routeId should include params', async () => {
      const { tripsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await tripsApi.getAll('route-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trips', { params: { routeId: 'route-1' } });
    });

    it('getDelayed should GET /trips/delayed', async () => {
      const { tripsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await tripsApi.getDelayed();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trips/delayed');
    });

    it('getAvailableSeats should GET /trips/:id/seats', async () => {
      const { tripsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: { available: 30 } });

      await tripsApi.getAvailableSeats('trip-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trips/trip-1/seats');
    });

    it('getByDriver should GET /trips/driver/:id', async () => {
      const { tripsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await tripsApi.getByDriver('driver-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/trips/driver/driver-1');
    });

    it('updateTime should PUT /trips/:id/time', async () => {
      const { tripsApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { id: 'trip-1' } });

      await tripsApi.updateTime('trip-1', '2026-01-01T10:00', '2026-01-01T14:00', 'op-1');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/trips/trip-1/time', {
        departureTime: '2026-01-01T10:00', arrivalTime: '2026-01-01T14:00', operatorId: 'op-1',
      });
    });
  });

  describe('bookingsApi', () => {
    it('getAll should GET /bookings', async () => {
      const { bookingsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await bookingsApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings', { params: undefined });
    });

    it('getByUser should GET /bookings/user/:userId', async () => {
      const { bookingsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await bookingsApi.getByUser('user-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/bookings/user/user-1');
    });

    it('create should POST /bookings', async () => {
      const { bookingsApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'booking-1' } });

      await bookingsApi.create({ userId: 'user-1', tripId: 'trip-1', seats: 2 });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/bookings', { userId: 'user-1', tripId: 'trip-1', seats: 2 });
    });

    it('confirm should PUT /bookings/:id/confirm', async () => {
      const { bookingsApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { status: 'CONFIRMED' } });

      await bookingsApi.confirm('booking-1');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/bookings/booking-1/confirm');
    });

    it('cancel should PUT /bookings/:id/cancel', async () => {
      const { bookingsApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { status: 'CANCELLED' } });

      await bookingsApi.cancel('booking-1');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/bookings/booking-1/cancel');
    });
  });

  describe('paymentsApi', () => {
    it('getAll should GET /payments', async () => {
      const { paymentsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await paymentsApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payments', { params: undefined });
    });

    it('getByBooking should GET /payments/booking/:id', async () => {
      const { paymentsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await paymentsApi.getByBooking('booking-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/payments/booking/booking-1');
    });

    it('create should POST /payments', async () => {
      const { paymentsApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'pay-1' } });

      await paymentsApi.create({ bookingId: 'booking-1', amount: 500 });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments', { bookingId: 'booking-1', amount: 500 });
    });

    it('process should POST /payments/:id/process', async () => {
      const { paymentsApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { status: 'COMPLETED' } });

      await paymentsApi.process('pay-1');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments/pay-1/process');
    });

    it('refund should POST /payments/:id/refund', async () => {
      const { paymentsApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { status: 'REFUNDED' } });

      await paymentsApi.refund('pay-1');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/payments/pay-1/refund');
    });
  });

  describe('usersApi', () => {
    it('getAll should GET /users', async () => {
      const { usersApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await usersApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: undefined });
    });

    it('getAll with role should include params', async () => {
      const { usersApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await usersApi.getAll('DRIVER');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users', { params: { role: 'DRIVER' } });
    });

    it('getDrivers should GET /users/drivers/list', async () => {
      const { usersApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await usersApi.getDrivers();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/drivers/list');
    });

    it('getOperators should GET /users/operators/list', async () => {
      const { usersApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await usersApi.getOperators();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/operators/list');
    });

    it('update should PUT /users/:id', async () => {
      const { usersApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { id: 'user-1' } });

      await usersApi.update('user-1', { firstName: 'Updated' });

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/users/user-1', { firstName: 'Updated' });
    });
  });

  describe('favoritesApi', () => {
    it('getAll should GET /favorites/:userId', async () => {
      const { favoritesApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await favoritesApi.getAll('user-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/favorites/user-1');
    });

    it('add should POST /favorites', async () => {
      const { favoritesApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'fav-1' } });

      await favoritesApi.add('user-1', 'route-1');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/favorites', { userId: 'user-1', routeId: 'route-1' });
    });

    it('remove should DELETE /favorites/:userId/:routeId', async () => {
      const { favoritesApi } = require('@/lib/api');
      mockAxiosInstance.delete.mockResolvedValue({ data: {} });

      await favoritesApi.remove('user-1', 'route-1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/favorites/user-1/route-1');
    });

    it('check should GET /favorites/:userId/:routeId', async () => {
      const { favoritesApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: { isFavorite: true } });

      await favoritesApi.check('user-1', 'route-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/favorites/user-1/route-1');
    });
  });

  describe('delaysApi', () => {
    it('getAll should GET /delays', async () => {
      const { delaysApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await delaysApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/delays', { params: undefined });
    });

    it('create should POST /delays', async () => {
      const { delaysApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'delay-1' } });

      await delaysApi.create({ tripId: 'trip-1', delayMinutes: 30 });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/delays', { tripId: 'trip-1', delayMinutes: 30 });
    });

    it('getByTrip should GET /delays/trip/:id', async () => {
      const { delaysApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await delaysApi.getByTrip('trip-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/delays/trip/trip-1');
    });
  });

  describe('chatApi', () => {
    it('getMessages should GET /chat/:driverId', async () => {
      const { chatApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await chatApi.getMessages('driver-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chat/driver-1');
    });

    it('sendMessage should POST /chat', async () => {
      const { chatApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'msg-1' } });

      await chatApi.sendMessage('driver-1', 'Hello');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/chat', { driverId: 'driver-1', content: 'Hello' });
    });

    it('markAsRead should PUT /chat/:id/read', async () => {
      const { chatApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { isRead: true } });

      await chatApi.markAsRead('msg-1');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/chat/msg-1/read');
    });

    it('getUnreadCount should GET /chat/:driverId/unread', async () => {
      const { chatApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: { count: 5 } });

      await chatApi.getUnreadCount('driver-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/chat/driver-1/unread');
    });
  });

  describe('ticketsApi', () => {
    it('getAll should GET /tickets', async () => {
      const { ticketsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await ticketsApi.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tickets', { params: undefined });
    });

    it('getAll with userId should include params', async () => {
      const { ticketsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await ticketsApi.getAll('user-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tickets', { params: { userId: 'user-1' } });
    });

    it('getByBooking should GET /tickets/booking/:id', async () => {
      const { ticketsApi } = require('@/lib/api');
      mockAxiosInstance.get.mockResolvedValue({ data: [] });

      await ticketsApi.getByBooking('booking-1');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/tickets/booking/booking-1');
    });

    it('create should POST /tickets', async () => {
      const { ticketsApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'ticket-1' } });

      await ticketsApi.create({ bookingId: 'booking-1', tripId: 'trip-1', seatNumber: 5 });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tickets', { bookingId: 'booking-1', tripId: 'trip-1', seatNumber: 5 });
    });

    it('validate should POST /tickets/:id/validate', async () => {
      const { ticketsApi } = require('@/lib/api');
      mockAxiosInstance.post.mockResolvedValue({ data: { valid: true } });

      await ticketsApi.validate('ticket-1');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/tickets/ticket-1/validate');
    });

    it('markAsUsed should PUT /tickets/:id/used', async () => {
      const { ticketsApi } = require('@/lib/api');
      mockAxiosInstance.put.mockResolvedValue({ data: { isUsed: true } });

      await ticketsApi.markAsUsed('ticket-1');

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/tickets/ticket-1/used');
    });
  });
});
