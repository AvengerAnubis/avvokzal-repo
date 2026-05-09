import { PrismaService } from '../../prisma/prisma.service';
export declare class RoutesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<({
        trips: {
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
        }[];
    } & {
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
    }) | null>;
    create(data: {
        name: string;
        description?: string;
        origin: string;
        destination: string;
        distance?: number;
        duration?: number;
        price: number;
    }): Promise<{
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
    }>;
    update(id: string, data: Partial<{
        name: string;
        description: string;
        origin: string;
        destination: string;
        distance: number;
        duration: number;
        price: number;
        isActive: boolean;
    }>): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    search(origin: string, destination: string): Promise<{
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
    }[]>;
}
