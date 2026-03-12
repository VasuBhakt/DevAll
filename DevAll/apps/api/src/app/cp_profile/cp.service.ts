import { PrismaService } from "@dev-all/database";
import { Injectable } from "@nestjs/common";
import { CFProfileFetcher } from "./fetchers/cf.fetch";
import { LCProfileFetcher } from "./fetchers/lc.fetch";

@Injectable()
export class CPProfileService {
    constructor(
        private prisma: PrismaService,
        private cfFetcher: CFProfileFetcher,
        private lcFetcher: LCProfileFetcher
    ) { }

    async profileSync(userId: string, username: string, platform: string) {
        switch (platform) {
            case "CODEFORCES":
                return await this.cfFetcher.fetch(username, userId);
            case "LEETCODE":

        }
    }
}