import { PrismaService } from '../../prisma/prisma.service';
export declare class DelaysService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(tripId?: string): Promise<({
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
        tripId: string;
        reason: string | null;
        delayMinutes: number;
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        reason: string | null;
        delayMinutes: number;
    }) | null>;
    create(data: {
        tripId: string;
        reason?: string;
        delayMinutes: number;
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
        tripId: string;
        reason: string | null;
        delayMinutes: number;
    }>;
    getByTrip(tripId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tripId: string;
        reason: string | null;
        delayMinutes: number;
    }[]>;
    getAllWithTrips(): Promise<({
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
        tripId: string;
        reason: string | null;
        delayMinutes: number;
    })[]>;
}
