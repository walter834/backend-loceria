import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";// 👈 AQUÍ ESTABA EL ERROR (antes era 'passport-local')
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) { // 'jwt' es el default, así que esto está bien
  constructor(
    configService: ConfigService,
    private usersService: UsersService, 
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: any) {
    // 👇 Buscamos el usuario COMPLETO en la BD
    return await this.usersService.findById(payload.sub);
  }
}