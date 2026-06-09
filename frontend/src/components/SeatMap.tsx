'use client';

import { useState, useEffect } from 'react';
import { tripsApi } from '@/lib/api';

interface Seat {
  number: number;
  status: 'available' | 'booked';
}

interface SeatMapProps {
  tripId: string;
  selectedSeats: number[];
  onSelectionChange: (seats: number[]) => void;
  maxSeats: number;
}

export default function SeatMap({ tripId, selectedSeats, onSelectionChange, maxSeats }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeats();
  }, [tripId]);

  const loadSeats = async () => {
    setLoading(true);
    try {
      const res = await tripsApi.getAvailableSeats(tripId);
      const seatMap: Seat[] = res.data.seatMap || [];
      setSeats(seatMap);
    } catch {
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSeat = (seatNumber: number) => {
    if (loading) return;

    const seat = seats.find(s => s.number === seatNumber);
    if (!seat || seat.status === 'booked') return;

    const isSelected = selectedSeats.includes(seatNumber);
    if (isSelected) {
      onSelectionChange(selectedSeats.filter(s => s !== seatNumber));
    } else if (selectedSeats.length < maxSeats) {
      onSelectionChange([...selectedSeats, seatNumber].sort((a, b) => a - b));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-color">
        <i className="pi pi-spin pi-spinner mr-2"></i> Загрузка схемы мест...
      </div>
    );
  }

  const rows: Seat[][] = [];
  const seatsPerRow = 4;
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    rows.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-sm mb-4">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded bg-gray-200 border border-gray-300"></div>
          <span className="text-gray-500">Свободно</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded bg-blue-600 border border-blue-700"></div>
          <span className="text-gray-500">Выбрано</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded bg-gray-500 border border-gray-600"></div>
          <span className="text-gray-500">Занято</span>
        </div>
      </div>

      {/* Bus body */}
      <div className="border-2 border-[var(--surface-border)] rounded-xl p-4 bg-[var(--surface-card)] max-w-xs mx-auto">
        {/* Steering wheel indicator */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-xs text-gray-500">
            Водитель
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-3">
              {row.map((seat, colIndex) => {
                const isSelected = selectedSeats.includes(seat.number);
                const isBooked = seat.status === 'booked';

                let bgColor = 'bg-gray-100 border-gray-300 text-gray-700';
                let cursor = 'cursor-pointer';
                if (isBooked) {
                  bgColor = 'bg-gray-400 border-gray-500 text-white cursor-not-allowed';
                  cursor = 'cursor-not-allowed';
                } else if (isSelected) {
                  bgColor = 'bg-blue-600 border-blue-700 text-white';
                }

                // Add aisle gap after 2nd seat in each row
                const isAisle = colIndex === 1;

                return (
                  <div key={seat.number} className="flex items-center">
                    <button
                      onClick={() => toggleSeat(seat.number)}
                      disabled={isBooked}
                      className={`
                        w-10 h-10 rounded-lg border-2 text-xs font-bold transition-colors
                        ${bgColor} ${cursor}
                        ${isAisle ? 'mr-4' : ''}
                      `}
                      title={`Место ${seat.number}${isBooked ? ' (занято)' : ''}`}
                    >
                      {seat.number}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm text-center text-muted-color">
        Выбрано: {selectedSeats.length} / {maxSeats}
        {selectedSeats.length > 0 && (
          <span className="ml-2 font-bold text-blue-600">
            (места {selectedSeats.join(', ')})
          </span>
        )}
      </div>
    </div>
  );
}