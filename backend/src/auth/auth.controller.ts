import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req) {
        // In a real app, we'd use a LocalAuthGuard here, but for simplicity we'll validate manually
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            return { statusCode: 401, message: 'Unauthorized' };
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() userData) {
        return this.authService.register(userData);
    }
}
