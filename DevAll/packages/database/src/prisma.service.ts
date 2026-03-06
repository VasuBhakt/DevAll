import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { prisma } from './prisma.client.js'

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
    public client = prisma

    async onModuleInit() {
        await this.client.$connect()
    }

    async onModuleDestroy() {
        await this.client.$disconnect()
    }
}

