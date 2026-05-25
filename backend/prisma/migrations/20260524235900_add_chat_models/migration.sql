-- Drop old chat_messages table
ALTER TABLE IF EXISTS "chat_messages" DROP CONSTRAINT IF EXISTS "chat_messages_driverId_fkey";
DROP TABLE IF EXISTS "chat_messages";

-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('WAITING', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "MessageSenderRole" AS ENUM ('DRIVER', 'OPERATOR', 'ADMIN');

-- AlterTable: add totalSeats to trips
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "totalSeats" INTEGER NOT NULL DEFAULT 40;

-- AlterTable: add seatNumbers and passengerEmail to bookings
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "seatNumbers" INTEGER[] NOT NULL DEFAULT '{}';
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "passengerEmail" TEXT;

-- CreateTable: chats
CREATE TABLE "chats" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "operatorId" TEXT,
    "status" "ChatStatus" NOT NULL DEFAULT 'WAITING',
    "lastHeartbeatAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable: messages
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "MessageSenderRole" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: chats → users (driver)
ALTER TABLE "chats" ADD CONSTRAINT "chats_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: chats → users (operator)
ALTER TABLE "chats" ADD CONSTRAINT "chats_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey: messages → chats
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: messages → users (sender)
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: buses
CREATE TABLE "buses" (
    "id" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "model" TEXT,
    "totalSeats" INTEGER NOT NULL DEFAULT 40,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buses_plateNumber_key" ON "buses"("plateNumber");

-- AlterTable: add busId to trips
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "busId" TEXT;

-- AddForeignKey: trips → buses
ALTER TABLE "trips" ADD CONSTRAINT "trips_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
