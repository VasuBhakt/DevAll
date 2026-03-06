import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type User } from '@dev-all/database';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signup(@Body() body: User) {
    return await this.authService.signup(body.email, body.password, body.name)
  }
}
