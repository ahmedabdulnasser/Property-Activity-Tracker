import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    console.log("JWT Guard activated"); // Debug log
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log("JWT Guard handleRequest:", { err, user: !!user, info }); // Debug log
    if (err || !user) {
      console.log("JWT Auth failed:", err || "No user", "Info:", info); // Debug log
      throw new UnauthorizedException();
    }
    return user;
  }
}
