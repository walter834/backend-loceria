import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local"; // 👈 CORREGIDO: Era passport-jwt
import { AuthService } from "../auth.service"; // 👈 CORREGIDO: Faltaba importar esto

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService){
        super({
            usernameField: 'email', // Ahora sí funcionará porque es Strategy de passport-local
        });
    }

    async validate(email: string, pass: string): Promise<any> {
        const user = await this.authService.validateUser(email, pass);

        if(!user){
            throw new UnauthorizedException('Credenciales incorrectas');
        }
        return user;
    }
}