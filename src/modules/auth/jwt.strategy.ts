import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "nWeave123s",
    });
  }

  async validate(payload: any) {
    console.log("JWT Payload received:", payload); // Debug log
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      console.log("User not found for ID:", payload.sub); // Debug log
      throw new UnauthorizedException();
    }
    console.log("User validated:", user.email); // Debug log
    return user;
  }
}
