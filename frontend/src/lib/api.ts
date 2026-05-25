import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Создаём axios instance с базовыми настройками
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен авторизации к каждому запросу
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ============== Auth ==============
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  register: async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response;
  },

  validate: async (token: string) => {
    const response = await api.get('/auth/validate');
    return response;
  },
};

// ============== Routes ==============
export const routesApi = {
  getAll: async () => {
    const response = await api.get('/routes');
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get(`/routes/${id}`);
    return response;
  },

  search: async (origin: string, destination: string) => {
    const response = await api.get('/routes/search', { params: { origin, destination } });
    return response;
  },

  create: async (data: any) => {
    const response = await api.post('/routes', data);
    return response;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/routes/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/routes/${id}`);
    return response;
  },
};

// ============== Trips ==============
export const tripsApi = {
  getAll: async (routeId?: string) => {
    const response = await api.get('/trips', routeId ? { params: { routeId } } : {});
    return response;
  },

  getByRoute: async (routeId: string) => {
    const response = await api.get(`/trips/route/${routeId}`);
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get(`/trips/${id}`);
    return response;
  },

  getByDriver: async (driverId: string) => {
    const response = await api.get(`/trips/driver/${driverId}`);
    return response;
  },

  getDelayed: async () => {
    const response = await api.get('/trips/delayed');
    return response;
  },

  updateTime: async (id: string, departureTime: string, arrivalTime: string, operatorId: string) => {
    const response = await api.put(`/trips/${id}/time`, { departureTime, arrivalTime, operatorId });
    return response;
  },

  create: async (data: { routeId: string; departureTime: string; arrivalTime: string; busNumber?: string; busId?: string; driverId?: string }) => {
    const response = await api.post('/trips', data);
    return response;
  },

  getAvailableSeats: async (tripId: string) => {
    const response = await api.get(`/trips/${tripId}/seats`);
    return response;
  },
};

// ============== Bookings ==============
export const bookingsApi = {
  getAll: async (userId?: string) => {
    const response = await api.get('/bookings', { params: userId ? { userId } : undefined });
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get(`/bookings/${id}`);
    return response;
  },

  getByUser: async (userId: string) => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response;
  },

  create: async (data: { userId: string; tripId: string; seatNumbers: number[]; passengerName?: string; passengerPhone?: string; passengerEmail?: string }) => {
    const response = await api.post('/bookings', data);
    return response;
  },

  confirm: async (id: string) => {
    const response = await api.put(`/bookings/${id}/confirm`);
    return response;
  },

  cancel: async (id: string) => {
    const response = await api.put(`/bookings/${id}/cancel`);
    return response;
  },
};

// ============== Payments ==============
export const paymentsApi = {
  getAll: async (bookingId?: string) => {
    const response = await api.get('/payments', { params: bookingId ? { bookingId } : undefined });
    return response;
  },

  getByBooking: async (bookingId: string) => {
    const response = await api.get(`/payments/booking/${bookingId}`);
    return response;
  },

  create: async (data: { bookingId: string; amount?: number; paymentMethod?: string }) => {
    const response = await api.post('/payments', data);
    return response;
  },

  process: async (id: string) => {
    const response = await api.post(`/payments/${id}/process`);
    return response;
  },

  refund: async (id: string) => {
    const response = await api.post(`/payments/${id}/refund`);
    return response;
  },
};

// ============== Users ==============
export const usersApi = {
  getAll: async (role?: string) => {
    const response = await api.get('/users', { params: role ? { role } : undefined });
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response;
  },

  create: async (data: any) => {
    const response = await api.post('/users', data);
    return response;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },

  getDrivers: async () => {
    const response = await api.get('/users/drivers/list');
    return response;
  },

  getOperators: async () => {
    const response = await api.get('/users/operators/list');
    return response;
  },
};

// ============== Favorites ==============
export const favoritesApi = {
  getAll: async () => {
    const response = await api.get('/favorites');
    return response;
  },

  add: async (routeId: string) => {
    const response = await api.post('/favorites', { routeId });
    return response;
  },

  remove: async (routeId: string) => {
    const response = await api.delete('/favorites', { data: { routeId } });
    return response;
  },

  check: async (routeId: string) => {
    const response = await api.get(`/favorites/check/${routeId}`);
    return response;
  },
};

// ============== Delays ==============
export const delaysApi = {
  getAll: async (tripId?: string) => {
    const response = await api.get('/delays', { params: tripId ? { tripId } : undefined });
    return response;
  },

  create: async (data: { tripId: string; reason?: string; delayMinutes: number }) => {
    const response = await api.post('/delays', data);
    return response;
  },

  getByTrip: async (tripId: string) => {
    const response = await api.get(`/delays/trip/${tripId}`);
    return response;
  },
};

// ============== Chat ==============
export const chatApi = {
  create: async (driverId: string, text: string) => {
    const response = await api.post('/chat', { driverId, text });
    return response;
  },

  heartbeat: async (chatId: string) => {
    const response = await api.post(`/chat/${chatId}/heartbeat`);
    return response;
  },

  getAvailable: async () => {
    const response = await api.get('/chat/available');
    return response;
  },

  assign: async (chatId: string, operatorId: string) => {
    const response = await api.post(`/chat/${chatId}/assign`, { operatorId });
    return response;
  },

  sendMessage: async (chatId: string, senderId: string, senderRole: 'DRIVER' | 'OPERATOR' | 'ADMIN', text: string) => {
    const response = await api.post(`/chat/${chatId}/message`, { senderId, senderRole, text });
    return response;
  },

  getMessages: async (chatId: string) => {
    const response = await api.get(`/chat/${chatId}/messages`);
    return response;
  },

  close: async (chatId: string, userId: string) => {
    const response = await api.post(`/chat/${chatId}/close`, { userId });
    return response;
  },

  getHistory: async (userId: string, role: string) => {
    const response = await api.get('/chat/history', { params: { userId, role } });
    return response;
  },

  getById: async (chatId: string, userId: string, role: string) => {
    const response = await api.get(`/chat/${chatId}`, { params: { userId, role } });
    return response;
  },

  getActiveByOperator: async (operatorId: string) => {
    const response = await api.get('/chat/active/operator', { params: { operatorId } });
    return response;
  },

  getDriverActiveChat: async (driverId: string) => {
    const response = await api.get('/chat/active/driver', { params: { driverId } });
    return response;
  },
};

// ============== Tickets ==============
export const ticketsApi = {
  getAll: async (userId?: string) => {
    const response = await api.get('/tickets', { params: userId ? { userId } : undefined });
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get(`/tickets/${id}`);
    return response;
  },

  getByBooking: async (bookingId: string) => {
    const response = await api.get(`/tickets/booking/${bookingId}`);
    return response;
  },

  create: async (data: { bookingId: string; tripId: string; seatNumber: number }) => {
    const response = await api.post('/tickets', data);
    return response;
  },

  validate: async (id: string) => {
    const response = await api.post(`/tickets/${id}/validate`);
    return response;
  },

  markAsUsed: async (id: string) => {
    const response = await api.put(`/tickets/${id}/used`);
    return response;
  },
};

// ============== Buses ==============
export const busesApi = {
  getAll: async () => {
    const response = await api.get('/buses');
    return response;
  },

  getById: async (id: string) => {
    const response = await api.get(`/buses/${id}`);
    return response;
  },

  create: async (data: { plateNumber: string; model?: string; totalSeats?: number }) => {
    const response = await api.post('/buses', data);
    return response;
  },

  update: async (id: string, data: { plateNumber?: string; model?: string; totalSeats?: number; isActive?: boolean }) => {
    const response = await api.put(`/buses/${id}`, data);
    return response;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/buses/${id}`);
    return response;
  },
};

export default api;
