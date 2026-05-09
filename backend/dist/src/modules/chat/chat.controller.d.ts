import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
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
    sendMessage(body: {
        driverId: string;
        content: string;
    }): Promise<{
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
    getUnreadCount(driverId: string): Promise<{
        count: number;
    }>;
}
