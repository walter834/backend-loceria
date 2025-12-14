import { 
    Controller, 
    Post, 
    UseGuards, 
    Req, 
    Res, 
    HttpStatus, 
    HttpCode, 
    Body
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // 👈 Ahora sí existe
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequirePermission } from './decorators/require-permission.decorator';
import { PermissionsGuard } from './guards/permissions.guard'; // 👈 Importar el guard correcto

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

 @Post('register')
 @UseGuards(JwtAuthGuard,PermissionsGuard)
 @RequirePermission('users:create')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Req() req: Request, 
    @Res({ passthrough: true }) res: Response,
  ) {
    // 👈 CORREGIDO: Agregamos '!' (req.user!) para decirle a TS que el usuario existe
    // También es buena práctica asegurarnos que el tipo User tenga id y email, 
    // pero por ahora lo manejamos como any o con acceso directo.
    const user = req.user as any; // Casting simple para evitar errores de TS por ahora
    const userId = user.id;
    const userEmail = user.email;

    const tokens = await this.authService.getTokens(userId, userEmail);

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // 👈 CORREGIDO: 'Lax' -> 'lax' (minúscula requerida por el tipo)
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    
    await this.authService.updateRefreshTokenHash(userId, tokens.refreshToken);

    return { 
      accessToken: tokens.accessToken,
    };
  }
}