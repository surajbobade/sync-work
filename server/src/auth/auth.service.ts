import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(data: RegisterDto) {
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create(data.email, hashedPassword);

        return {
            id: user.id,
            email: user.email,
        };
    }

    async login(data: LoginDto) {
        const user = await this.usersService.findByEmail(data.email);
        if (!user) {
            throw new UnauthorizedException();
        }

        const isPasswordCorrect = await bcrypt.compare(
            data.password,
            user.password,
        );
        if (!isPasswordCorrect) {
            throw new UnauthorizedException();
        }

        const tokens = await this.generateTokens(user.id, user.email);

        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    private async generateTokens(userId: string, email: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: process.env.JWT_ACCESS_SECRET,
                    expiresIn: '15m',
                },
            ),

            this.jwtService.signAsync(
                {
                    sub: userId,
                    email,
                },
                {
                    secret: process.env.JWT_REFRESH_SECRET,
                    expiresIn: '7d',
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

        await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
    }

    async refresh(refreshToken: string) {
        const payload = await this.jwtService.verifyAsync(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
        });

        const user = await this.usersService.findById(payload.sub);
        if (!user?.hashedRefreshToken) {
            throw new UnauthorizedException();
        }

        const matches = await bcrypt.compare(
            refreshToken,
            user.hashedRefreshToken,
        );

        if (!matches) {
            throw new UnauthorizedException();
        }

        const tokens = await this.generateTokens(user.id, user.email);

        await this.updateRefreshToken(user.id, tokens.refreshToken);

        return tokens;
    }

    async logout(userId: string) {
        await this.usersService.updateRefreshToken(userId, null);
    }
}
