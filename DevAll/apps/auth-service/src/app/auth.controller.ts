import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type User } from '@dev-all/database';
import { APIResponse } from '@dev-all/helpers';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() body: User) {
    const createdUser = await this.authService.signup(body.email, body.password, body.name);
    return new APIResponse(201, "User created successfully", createdUser)
  }
}
