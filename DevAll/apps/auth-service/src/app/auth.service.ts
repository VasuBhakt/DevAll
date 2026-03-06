import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async signup(email: string, password: string, name: string) {
    console.log("User created successfully!")
    return this.prisma.client.user.create({
      data: {
        id: randomUUID(),
        email,
        password,
        name,
      },
    });
  }
}
