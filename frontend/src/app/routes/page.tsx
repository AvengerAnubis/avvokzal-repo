'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { routesApi, tripsApi, bookingsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth/context';
import SeatMap from '@/components/SeatMap';

export default function RoutesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hasMounted = useRef(false);
  useEffect(() => { hasMounted.current = true; }, []);

  // Multi-step booking
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [routeTrips, setRouteTrips] = useState<any[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [seats, setSeats] = useState<number>(1);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [passengerEmail, setPassengerEmail] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  useEffect(() => {
    routesApi.getAll()
      .then(res => setRoutes(res.data || []))
      .catch(() => setRoutes([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusSeverity = (status: string): 'success' | 'warning' | 'info' | 'danger' | 'secondary' => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'secondary'> = {
      SCHEDULED: 'success',
      DELAYED: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'secondary',
      CANCELLED: 'danger',
    };
    return map[status] || 'info';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      SCHEDULED: 'В ожидании',
      DELAYED: 'Задержка',
      IN_PROGRESS: 'В пути',
      COMPLETED: 'Завершён',
      CANCELLED: 'Отменён',
    };
    return map[status] || status;
  };

  const handleBookClick = async (route: any) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userStr = localStorage.getItem('user');
      if (!token) {
        router.push('/auth/login?redirect=/routes');
        return;
      }
      try {
        const storedUser = userStr ? JSON.parse(userStr) : null;
        setPassengerName(storedUser?.firstName ? `${storedUser.firstName} ${storedUser.lastName}` : '');
        setPassengerPhone(storedUser?.phone || '');
        setPassengerEmail(storedUser?.email || '');
      } catch {
        router.push('/auth/login?redirect=/routes');
        return;
      }
    }
    setSelectedRoute(route);
    setSelectedTrip(null);
    setSeats(1);
    setSelectedSeatNumbers([]);
    setBookingSuccess(false);
    setCreatedBooking(null);
    setActiveStep(0);

    setTripsLoading(true);
    setRouteTrips([]);
    setShowBookingDialog(true);
    try {
      const res = await tripsApi.getByRoute(route.id);
      const now = new Date();
      const upcoming = (res.data || []).filter((trip: any) => {
        const departure = new Date(trip.departureTime);
        return trip.status === 'SCHEDULED' && departure > now;
      });
      setRouteTrips(upcoming);
    } catch {
      setRouteTrips([]);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!selectedTrip || seats < 1) return;
      setSelectedSeatNumbers([]);
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (selectedSeatNumbers.length !== seats) return;
      setActiveStep(2);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) setActiveStep(activeStep - 1);
  };

  const handleSubmitBooking = async () => {
    if (!selectedTrip || !user || selectedSeatNumbers.length !== seats || !passengerName) return;

    setBookingLoading(true);
    try {
      const bookingData = {
        userId: user.id,
        tripId: selectedTrip.id,
        seatNumbers: selectedSeatNumbers,
        passengerName,
        passengerPhone,
        passengerEmail,
      };
      const res = await bookingsApi.create(bookingData);
      setCreatedBooking(res.data);
      setActiveStep(3);
      setBookingSuccess(true);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.message || 'Ошибка при создании бронирования');
    } finally {
      setBookingLoading(false);
    }
  };

  const tripOptions = routeTrips.map((trip: any) => ({
    label: `${new Date(trip.departureTime).toLocaleString('ru-RU')} — ${trip.busNumber || 'без номера'}`,
    value: trip.id,
    trip,
  }));

  const totalPrice = selectedTrip ? Number(selectedRoute.price) * seats : 0;

  const routeNameTemplate = (rowData: any) => {
    return (
      <div>
        <div className="font-bold">{rowData.name}</div>
        <div className="text-sm text-gray-500">{rowData.origin} → {rowData.destination}</div>
      </div>
    );
  };

  const priceTemplate = (rowData: any) => {
    return <span className="text-green-600 font-bold">{rowData.price} ₽</span>;
  };

  const statusTemplate = (rowData: any) => {
    return (
      <span className={`px-2 py-1 rounded text-sm ${rowData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {rowData.isActive ? 'Активный' : 'Неактивный'}
      </span>
    );
  };

  const actionsTemplate = (rowData: any) => {
    if (!rowData.isActive) {
      return <Tag severity="secondary" value="Недоступен" />;
    }
    return (
      <Button
        label="Забронировать"
        icon="pi pi-ticket"
        size="small"
        onClick={() => handleBookClick(rowData)}
      />
    );
  };

  const closeBookingDialog = () => {
    setShowBookingDialog(false);
    setSelectedRoute(null);
    setRouteTrips([]);
    setSelectedTrip(null);
    setSeats(1);
    setSelectedSeatNumbers([]);
    setPassengerName('');
    setPassengerPhone('');
    setPassengerEmail('');
    setBookingSuccess(false);
    setCreatedBooking(null);
    setActiveStep(0);
  };

  const stepLabels = ['Рейс и места', 'Выбор мест', 'Данные пассажира'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Маршруты</h1>

      <Card>
        <DataTable value={routes} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="name" sortOrder={1}>
          <Column header="Маршрут" body={routeNameTemplate} sortable />
          <Column header="Расстояние (км)" field="distance" sortable />
          <Column header="Время (мин)" field="duration" sortable />
          <Column header="Цена" body={priceTemplate} />
          <Column header="Статус" body={statusTemplate} />
          <Column header="Действия" body={actionsTemplate} style={{ minWidth: '160px' }} />
        </DataTable>
      </Card>

      <Dialog
        header={selectedRoute ? `Бронирование: ${selectedRoute.origin} → ${selectedRoute.destination}` : 'Бронирование'}
        visible={showBookingDialog}
        onHide={closeBookingDialog}
        style={{ width: '600px' }}
      >
        {bookingSuccess && createdBooking ? (
          <div className="text-center space-y-4 py-4">
            <i className="pi pi-check-circle text-5xl text-green-500"></i>
            <p className="text-xl font-bold">Бронирование создано!</p>
            <p className="text-sm text-muted-color">
              Выбраны места: {createdBooking.seatNumbers?.join(', ') || createdBooking.seats}
            </p>
            <p className="text-muted-color text-sm">Для завершения необходимо оплатить билет.</p>
            <div className="flex justify-center gap-3 mt-4">
              <Button
                label="Оплатить сейчас"
                icon="pi pi-credit-card"
                onClick={() => { closeBookingDialog(); router.push(`/payment?bookingId=${createdBooking.id}`); }}
              />
              <Button
                label="Позже"
                className="p-button-outlined"
                onClick={() => { closeBookingDialog(); router.push('/profile/tickets'); }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Steps indicator */}
            <div className="flex justify-center gap-1 mb-4">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center">
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                    i === activeStep ? 'bg-primary-100 text-primary font-bold' :
                    i < activeStep ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      i === activeStep ? 'bg-primary text-white' :
                      i < activeStep ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                    }`}>{i + 1}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && <div className="w-6 h-px bg-gray-300 mx-1"></div>}
                </div>
              ))}
            </div>

            {/* Step 1: Select trip + seat count */}
            {activeStep === 0 && (
              <div className="space-y-4">
                <div className="p-3 bg-primary-100 border-round">
                  <div className="font-bold text-lg">{selectedRoute?.origin} → {selectedRoute?.destination}</div>
                  <div className="text-sm text-muted-color mt-1">
                    Цена за место: <span className="font-bold text-green-700">{selectedRoute?.price} ₽</span>
                  </div>
                </div>

                {tripsLoading ? (
                  <div className="text-center py-4 text-muted-color">
                    <i className="pi pi-spin pi-spinner mr-2"></i> Загрузка рейсов...
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Выберите рейс</label>
                      {tripOptions.length === 0 ? (
                        <div className="text-sm p-3 border border-yellow-200 rounded bg-yellow-50 text-yellow-800">
                          <i className="pi pi-info-circle mr-2"></i>
                          Нет доступных рейсов для этого маршрута
                        </div>
                      ) : (
                        <Dropdown
                          className="w-full"
                          options={tripOptions}
                          value={selectedTrip ? selectedTrip.id : null}
                          onChange={(e) => {
                            const opt = tripOptions.find(o => o.value === e.value);
                            setSelectedTrip(opt?.trip || null);
                          }}
                          placeholder="Выберите дату и время"
                          filter
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Количество мест</label>
                      <InputNumber
                        value={seats}
                        onValueChange={(e) => setSeats(e.value || 1)}
                        min={1}
                        max={10}
                        showButtons
                        className="w-full"
                      />
                    </div>

                    {selectedTrip && (
                      <div className="flex justify-between items-center p-3 bg-green-50 border-round">
                        <span className="font-bold text-lg">Итого:</span>
                        <span className="text-xl font-bold text-green-700">{totalPrice} ₽</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 2: Seat selection */}
            {activeStep === 1 && selectedTrip && (
              <div className="space-y-4">
                <div className="p-3 bg-primary-100 border-round text-sm">
                  <span className="font-bold">{selectedRoute?.origin} → {selectedRoute?.destination}</span>
                  <span className="text-muted-color ml-2">
                    {new Date(selectedTrip.departureTime).toLocaleString('ru-RU')}
                  </span>
                </div>
                <p className="text-sm text-muted-color">
                  Выберите <strong>ровно {seats}</strong> мест{seats > 1 ? 'а' : 'о'}
                </p>
                <SeatMap
                  tripId={selectedTrip.id}
                  selectedSeats={selectedSeatNumbers}
                  onSelectionChange={setSelectedSeatNumbers}
                  maxSeats={seats}
                />
              </div>
            )}

            {/* Step 3: Passenger info */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 bg-primary-100 border-round text-sm">
                  <div className="font-bold">{selectedRoute?.origin} → {selectedRoute?.destination}</div>
                  <div className="text-muted-color">
                    {new Date(selectedTrip?.departureTime).toLocaleString('ru-RU')} | Места: {selectedSeatNumbers.join(', ')}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">ФИО пассажира</label>
                  <InputText
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    className="w-full"
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Номер телефона</label>
                  <InputText
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    className="w-full"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Электронная почта</label>
                  <InputText
                    value={passengerEmail}
                    onChange={(e) => setPassengerEmail(e.target.value)}
                    className="w-full"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 border-round">
                  <span className="font-bold text-lg">Итого:</span>
                  <span className="text-xl font-bold text-green-700">{totalPrice} ₽</span>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            {activeStep < 3 && (
              <div className="flex justify-between gap-2 mt-4">
                <div>
                  {activeStep > 0 ? (
                    <Button label="Назад" icon="pi pi-chevron-left" className="p-button-text" onClick={handlePrevStep} />
                  ) : (
                    <Button label="Отмена" className="p-button-text" onClick={closeBookingDialog} />
                  )}
                </div>
                {activeStep < 2 ? (
                  <Button
                    label="Далее"
                    icon="pi pi-chevron-right"
                    iconPos="right"
                    onClick={handleNextStep}
                    disabled={
                      (activeStep === 0 && (!selectedTrip || seats < 1)) ||
                      (activeStep === 1 && selectedSeatNumbers.length !== seats)
                    }
                  />
                ) : (
                  <Button
                    label="Забронировать"
                    icon="pi pi-check"
                    onClick={handleSubmitBooking}
                    loading={bookingLoading}
                    disabled={!passengerName}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}