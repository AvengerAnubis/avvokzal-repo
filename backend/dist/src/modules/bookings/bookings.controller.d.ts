import { BookingsService } from './bookings.service';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    findAll(userId?: string): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paymentMethod: string | null;
            transactionId: string | null;
            paidAt: Date | null;
        } | null;
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
    })[]>;
    getByUser(userId: string): Promise<({
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
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paymentMethod: string | null;
            transactionId: string | null;
            paidAt: Date | null;
        } | null;
        tickets: {
            id: string;
            createdAt: Date;
            tripId: string;
            bookingId: string;
            seatNumber: number;
            qrCode: string | null;
            isUsed: boolean;
            usedAt: Date | null;
        }[];
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
    })[]>;
    findOne(id: string): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
        };
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
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            amount: import("@prisma/client-runtime-utils").Decimal;
            paymentMethod: string | null;
            transactionId: string | null;
            paidAt: Date | null;
        } | null;
        tickets: {
            id: string;
            createdAt: Date;
            tripId: string;
            bookingId: string;
            seatNumber: number;
            qrCode: string | null;
            isUsed: boolean;
            usedAt: Date | null;
        }[];
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
    }) | null>;
    create(body: {
        userId: string;
        tripId: string;
        seats: number;
        passengerName?: string;
        passengerPhone?: string;
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
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string;
        tripId: string;
        seats: number;
        totalPrice: import("@prisma/client-runtime-utils").Decimal;
        passengerName: string | null;
        passengerPhone: string | null;
    }>;
    update(id: string, body: Partial<{
        seats: number;
        status: any;
        passengerName: string;
        passengerPhone: string;
    }>): Promise<{
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
    }>;
    confirm(id: string): Promise<{
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
        tickets: {
            id: string;
            createdAt: Date;
            tripId: string;
            bookingId: string;
            seatNumber: number;
            qrCode: string | null;
            isUsed: boolean;
            usedAt: Date | null;
        }[];
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
    }>;
    cancel(id: string): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}
