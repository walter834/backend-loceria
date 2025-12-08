import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 1. Validar Usuario (Login) - Seguridad Real
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    // Si el usuario no existe, retornamos null (Passport lanzará 401)
    if (!user) return null;

    // 🔒 BCRYPT: Comparamos la contraseña plana con el hash de la BD
    const isMatch = await bcrypt.compare(pass, user.password);
    
    if (user && isMatch) {
      // Eliminamos password y refreshToken antes de devolver el usuario
      const { password, hashedRefreshToken, ...result } = user;
      return result;
    }
    
    return null;
  }

  // 2. Generar Tokens (JWT)
  async getTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      // Access Token (Corta duración)
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      // Refresh Token (Larga duración)
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  // 3. Hash y Guardado del Refresh Token
  async updateRefreshTokenHash(userId: number, refreshToken: string) {
    // 🔒 BCRYPT: Hasheamos el refresh token antes de guardarlo en BD.
    // Si alguien roba la BD, no tendrá los tokens de sesión activos.
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(refreshToken, salt);
    
    await this.usersService.updateRefreshToken(userId, hash);
  }

  // 4. Registro de Usuario (Nuevo helper para crear usuarios seguros)
  async register(registerDto: any) { // Define un DTO real aquí
    // Validar si existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) throw new BadRequestException('El usuario ya existe');

    // Hashear password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    // Crear usuario
    return this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }
}