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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const user_service_1 = require("../user/user.service");
const sales_rep_service_1 = require("../sales-rep/sales-rep.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(userService, salesRepService, jwtService) {
        this.userService = userService;
        this.salesRepService = salesRepService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.userService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password: _, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id };
        console.log("Creating JWT with payload:", payload);
        const salesRep = await this.salesRepService.findByUserId(user.id);
        const token = this.jwtService.sign(payload);
        console.log("JWT created successfully");
        return {
            access_token: token,
            user,
            salesRep,
        };
    }
    async register(createUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const userData = {
            ...createUserDto,
            password: hashedPassword,
        };
        const user = await this.userService.create(userData);
        const salesRep = await this.salesRepService.create({ userId: user.id });
        const { password: _, ...userResult } = user;
        return this.login(userResult);
    }
    async validateUserById(userId) {
        try {
            console.log("Validating user ID:", userId);
            const user = await this.userService.findById(userId);
            if (user) {
                const salesRep = await this.salesRepService.findByUserId(userId);
                console.log("User found:", user.email, "SalesRep:", !!salesRep);
                return { ...user, salesRep };
            }
            console.log("User not found for ID:", userId);
            return null;
        }
        catch (error) {
            console.error("Error validating user:", error);
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        sales_rep_service_1.SalesRepService,
        jwt_1.JwtService])
], AuthService);
