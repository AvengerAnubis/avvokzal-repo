import { PrismaService } from '../../prisma/prisma.service';
export declare class FavoritesService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
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
        routeId: string;
        userId: string;
    })[]>;
    add(userId: string, routeId: string): Promise<{
        id: string;
        createdAt: Date;
        routeId: string;
        userId: string;
    }>;
    remove(userId: string, routeId: string): Promise<{
        id: string;
        createdAt: Date;
        routeId: string;
        userId: string;
    }>;
    isFavorite(userId: string, routeId: string): Promise<{
        isFavorite: boolean;
    }>;
}
