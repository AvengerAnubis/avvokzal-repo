import { PrismaService } from '../../prisma/prisma.service';
export declare class ChatService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getMessages(driverId: string): Promise<({
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        driverId: string;
        content: string;
        isRead: boolean;
    })[]>;
    sendMessage(driverId: string, content: string): Promise<{
        driver: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        driverId: string;
        content: string;
        isRead: boolean;
    }>;
    markAsRead(messageId: string): Promise<{
        id: string;
        createdAt: Date;
        driverId: string;
        content: string;
        isRead: boolean;
    }>;
    markAllAsRead(driverId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(driverId: string): Promise<{
        count: number;
    }>;
}
