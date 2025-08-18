import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user", description: "Creates a new user account." })
  @ApiBody({ schema: { example: { email: "user@example.com", password: "string", name: "string" } } })
  @ApiResponse({ status: 201, description: "User registered successfully." })
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login", description: "Authenticate user and return JWT token." })
  @ApiBody({ schema: { example: { email: "user@example.com", password: "string" } } })
  @ApiResponse({ status: 201, description: "JWT token returned." })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }
}
