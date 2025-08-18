import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { SalesRepService } from "../sales-rep/sales-rep.service";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly salesRepService: SalesRepService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    console.log("Creating JWT with payload:", payload); // Debug log
    const salesRep = await this.salesRepService.findByUserId(user.id);

    const token = this.jwtService.sign(payload);
    console.log("JWT created successfully"); // Debug log

    return {
      access_token: token,
      user,
      salesRep,
    };
  }

  async register(createUserDto: any) {
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

  async validateUserById(userId: number) {
    try {
      console.log("Validating user ID:", userId); // Debug log
      const user = await this.userService.findById(userId);
      if (user) {
        const salesRep = await this.salesRepService.findByUserId(userId);
        console.log("User found:", user.email, "SalesRep:", !!salesRep); // Debug log
        return { ...user, salesRep };
      }
      console.log("User not found for ID:", userId); // Debug log
      return null;
    } catch (error) {
      console.error("Error validating user:", error); // Debug log
      return null;
    }
  }
}
