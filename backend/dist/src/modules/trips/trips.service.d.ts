import { PrismaService } from '../../prisma/prisma.service';
import { TripStatus } from '@prisma/client';
export declare class TripsService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findByRoute(routeId: string): Promise<({
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
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
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
    })[]>;
    findAll(routeId?: string): Promise<({
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
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
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
    })[]>;
    findOne(id: string): Promise<({
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
        bookings: ({
            user: {
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phone: string | null;
                role: import(".prisma/client").$Enums.UserRole;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
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
        })[];
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
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
    }) | null>;
    create(data: {
        routeId: string;
        departureTime: Date;
        arrivalTime: Date;
        busNumber?: string;
        driverId?: string;
    }): Promise<{
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
    }>;
    update(id: string, data: Partial<{
        departureTime: Date;
        arrivalTime: Date;
        status: TripStatus;
        busNumber: string;
        driverId: string;
        operatorId: string;
    }>): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    getByDriver(driverId: string): Promise<({
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
    })[]>;
    getDelayed(): Promise<({
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
        delays: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tripId: string;
            reason: string | null;
            delayMinutes: number;
        }[];
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
    })[]>;
    updateTime(id: string, departureTime: Date, arrivalTime: Date, operatorId: string): Promise<{
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
    }>;
    getByDate(date: Date): Promise<({
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
    })[]>;
    getAvailableSeats(tripId: string): Promise<{
        totalSeats: number;
        bookedSeats: number;
        availableSeats: number;
    }>;
}
