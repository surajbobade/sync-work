import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { REFRESH_TOKEN_AGE } from './constant';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(@Body() data: RegisterDto) {
        return this.authService.register(data);
    }

    @Post('login')
    async login(
        @Body() data: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const tokens = await this.authService.login(data);
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_AGE,
        });

        return {
            accessToken: tokens.accessToken,
        };
    }

    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        console.log({ cookiers: req.cookies })
        const refreshToken = req.cookies.refreshToken;

        const tokens = await this.authService.refresh(refreshToken);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_AGE,
        });

        return {
            accessToken: tokens.accessToken,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req, @Res({ passthrough: true }) res) {
        await this.authService.logout(req.user.userId);

        res.clearCookie('refreshToken');

        return {
            message: 'Logged out',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req) {
        return req.user;
    }
}
