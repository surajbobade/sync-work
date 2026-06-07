import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    create(email: string, password: string) {
        return this.prisma.user.create({
            data: {
                email,
                password,
            },
        });
    }

    findById(id: string) {
        return this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    updateRefreshToken(userId: string, hashedRefreshToken: string | null) {
        return this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRefreshToken,
            },
        });
    }
}
