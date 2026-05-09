"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChatService = ChatService_1 = class ChatService {
    prisma;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMessages(driverId) {
        this.logger.log(`getMessages (driverId: ${driverId})`);
        return this.prisma.chatMessage.findMany({
            where: { driverId },
            include: {
                driver: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async sendMessage(driverId, content) {
        this.logger.log(`sendMessage (driverId: ${driverId}, content: "${content.substring(0, 50)}...")`);
        return this.prisma.chatMessage.create({
            data: { driverId, content },
            include: {
                driver: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async markAsRead(messageId) {
        this.logger.log(`markAsRead (messageId: ${messageId})`);
        return this.prisma.chatMessage.update({
            where: { id: messageId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(driverId) {
        this.logger.log(`markAllAsRead (driverId: ${driverId})`);
        return this.prisma.chatMessage.updateMany({
            where: { driverId, isRead: false },
            data: { isRead: true },
        });
    }
    async getUnreadCount(driverId) {
        this.logger.log(`getUnreadCount (driverId: ${driverId})`);
        const count = await this.prisma.chatMessage.count({
            where: { driverId, isRead: false },
        });
        return { count };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map