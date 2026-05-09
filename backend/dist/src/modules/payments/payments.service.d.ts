import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(bookingId?: string): Promise<({
        booking: {
            trip: {
                route: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    origin: string;
                    destination: string;
                    distance: number | null;
                    duration: number | null;
                    price: import("@prisma/client-runtime-utils").Decimal;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                departureTime: Date;
                arrivalTime: Date;
                status: import(".prisma/client").$Enums.TripStatus;
                busNumber: string | null;
                driverId: string | null;
                operatorId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            userId: string;
            tripId: string;
            seats: number;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            passengerName: string | null;
            passengerPhone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    })[]>;
    findOne(id: string): Promise<({
        booking: {
            trip: {
                route: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    origin: string;
                    destination: string;
                    distance: number | null;
                    duration: number | null;
                    price: import("@prisma/client-runtime-utils").Decimal;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                departureTime: Date;
                arrivalTime: Date;
                status: import(".prisma/client").$Enums.TripStatus;
                busNumber: string | null;
                driverId: string | null;
                operatorId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            userId: string;
            tripId: string;
            seats: number;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            passengerName: string | null;
            passengerPhone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    }) | null>;
    findByBooking(bookingId: string): Promise<({
        booking: {
            trip: {
                route: {
                    id: string;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string | null;
                    origin: string;
                    destination: string;
                    distance: number | null;
                    duration: number | null;
                    price: import("@prisma/client-runtime-utils").Decimal;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                routeId: string;
                departureTime: Date;
                arrivalTime: Date;
                status: import(".prisma/client").$Enums.TripStatus;
                busNumber: string | null;
                driverId: string | null;
                operatorId: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            userId: string;
            tripId: string;
            seats: number;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            passengerName: string | null;
            passengerPhone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    }) | null>;
    create(data: {
        bookingId: string;
        amount: number;
        paymentMethod?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    }>;
    update(id: string, data: Partial<{
        status: PaymentStatus;
        transactionId: string;
        paidAt: Date;
    }>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    }>;
    process(id: string): Promise<{
        booking: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.BookingStatus;
            userId: string;
            tripId: string;
            seats: number;
            totalPrice: import("@prisma/client-runtime-utils").Decimal;
            passengerName: string | null;
            passengerPhone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    }>;
    refund(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bookingId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentMethod: string | null;
        transactionId: string | null;
        paidAt: Date | null;
    }>;
}
