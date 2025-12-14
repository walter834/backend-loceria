import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-local";
import { UsersService } from "src/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
        })
    }

    async validate(payload: any) {
        // ⚠️ CRÍTICO: Buscar el usuario en la BD.
        // Como en UserEntity pusimos @ManyToOne(..., { eager: true }), esto traerá el Rol automáticamente.
        const user = await this.usersService.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado o inactivo');
        }

        // Retornamos el usuario completo para que el PermissionsGuard pueda leer user.role.permissions
        return user;
    }
}