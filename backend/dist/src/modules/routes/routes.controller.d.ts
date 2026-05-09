import { RoutesService } from './routes.service';
export declare class RoutesController {
    private routesService;
    constructor(routesService: RoutesService);
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
    create(body: {
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
    update(id: string, body: Partial<{
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
}
