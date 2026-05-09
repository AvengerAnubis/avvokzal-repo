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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelaysController = void 0;
const common_1 = require("@nestjs/common");
const delays_service_1 = require("./delays.service");
let DelaysController = class DelaysController {
    delaysService;
    constructor(delaysService) {
        this.delaysService = delaysService;
    }
    async findAll(tripId) {
        return this.delaysService.findAll(tripId);
    }
    async getAllWithTrips() {
        return this.delaysService.getAllWithTrips();
    }
    async getByTrip(tripId) {
        return this.delaysService.getByTrip(tripId);
    }
    async findOne(id) {
        return this.delaysService.findOne(id);
    }
    async create(body) {
        return this.delaysService.create(body);
    }
};
exports.DelaysController = DelaysController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DelaysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DelaysController.prototype, "getAllWithTrips", null);
__decorate([
    (0, common_1.Get)('trip/:tripId'),
    __param(0, (0, common_1.Param)('tripId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DelaysController.prototype, "getByTrip", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DelaysController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DelaysController.prototype, "create", null);
exports.DelaysController = DelaysController = __decorate([
    (0, common_1.Controller)('api/delays'),
    __metadata("design:paramtypes", [delays_service_1.DelaysService])
], DelaysController);
//# sourceMappingURL=delays.controller.js.map