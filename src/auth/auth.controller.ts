// src/auth/auth.controller.ts
import { 
    Controller, 
    Post, 
    Body, 
    UseGuards, 
    Req, 
    Res, 
    HttpStatus, 
    HttpCode 
} from '@nestjs/common';
import { Request, Response } from 'express'; // 💡 Importamos Request/Response de Express
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
// 💡 Necesitarás un DTO para el registro (RegisterDto), lo usaremos en el servicio.

@Controller('auth')
export class AuthController {
  // Inyección de Dependencia: Le pedimos a NestJS el AuthService
  constructor(private authService: AuthService) {}

  // --- 1. LOGIN (La ruta más importante con Guard y Cookie) ---
  
  // @UseGuards(LocalAuthGuard) ⬅️ Esto es lo primero que se ejecuta.
  //   1. Recibe 'email' y 'password'.
  //   2. Llama a tu LocalStrategy.validate().
  //   3. Si es exitoso, ¡adjunta el usuario a req.user! Si falla, lanza 401 Unauthorized.
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK) // Asegura que la respuesta sea 200
  @Post('login')
  async login(
    @Req() req: Request, 
    // @Res({ passthrough: true }) ⬅️ MUY IMPORTANTE: Permite usar res.cookie() 
    // sin interrumpir el manejo de la respuesta de NestJS.
    @Res({ passthrough: true }) res: Response,
  ) {
    // 💡 Paso 1: El usuario validado ya está aquí (gracias al Guard)
    const userId = req.user['id'];
    const userEmail = req.user['email'];

    // 💡 Paso 2: Delegar la generación de tokens al Servicio
    const tokens = await this.authService.getTokens(userId, userEmail);

    // 🍪 Paso 3: Configurar la Cookie HTTP-only (Máxima Seguridad)
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true, // 🔒 No accesible por JavaScript del frontend (anti-XSS)
      secure: process.env.NODE_ENV === 'production', // 🔒 Solo si usas HTTPS en prod.
      sameSite: 'Lax', // 🔒 Ayuda a mitigar ataques CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días (Duración del Refresh Token)
    });
    
    // 💡 Paso 4: Delegar la actualización del hash del Refresh Token en la DB
    await this.authService.updateRefreshTokenHash(userId, tokens.refreshToken);

    // 💡 Paso 5: Devolvemos SOLO el Access Token (para que el frontend lo use en el header Bearer)
    return { 
      accessToken: tokens.accessToken,
      // Nota: El Refresh Token NUNCA se devuelve en el cuerpo, solo va en la cookie.
    };
  }
  
  // // --- Aquí irían 'register', 'refresh', 'logout' (como vimos antes) ---
}