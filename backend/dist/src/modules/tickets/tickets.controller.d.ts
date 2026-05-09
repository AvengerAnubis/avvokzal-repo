import { TicketsService } from './tickets.service';
export declare class TicketsController {
    private ticketsService;
    constructor(ticketsService: TicketsService);
    findAll(userId?: string): Promise<({
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
        tripId: string;
        bookingId: string;
        seatNumber: number;
        qrCode: string | null;
        isUsed: boolean;
        usedAt: Date | null;
    })[]>;
    findByBooking(bookingId: string): Promise<({
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
        tripId: string;
        bookingId: string;
        seatNumber: number;
        qrCode: string | null;
        isUsed: boolean;
        usedAt: Date | null;
    })[]>;
    findOne(id: string): Promise<({
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
        tripId: string;
        bookingId: string;
        seatNumber: number;
        qrCode: string | null;
        isUsed: boolean;
        usedAt: Date | null;
    }) | null>;
    create(body: {
        bookingId: string;
        tripId: string;
        seatNumber: number;
    }): Promise<{
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
        tripId: string;
        bookingId: string;
        seatNumber: number;
        qrCode: string | null;
        isUsed: boolean;
        usedAt: Date | null;
    }>;
    markAsUsed(id: string): Promise<{
        id: string;
        createdAt: Date;
        tripId: string;
        bookingId: string;
        seatNumber: number;
        qrCode: string | null;
        isUsed: boolean;
        usedAt: Date | null;
    }>;
    validate(id: string): Promise<{
        valid: boolean;
        error: string;
        ticket?: undefined;
    } | {
        valid: boolean;
        ticket: {
            trip: {
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
            tripId: string;
            bookingId: string;
            seatNumber: number;
            qrCode: string | null;
            isUsed: boolean;
            usedAt: Date | null;
        };
        error?: undefined;
    }>;
}
