-- CreateTable
CREATE TABLE "booking_seats" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booking_seats_bookingId_seatNumber_key" ON "booking_seats"("bookingId", "seatNumber");

-- AddForeignKey
ALTER TABLE "booking_seats" ADD CONSTRAINT "booking_seats_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
