import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy){
    constructor(private authService: AuthService){
        super({
            usernameField: 'email', // Le decimos que el campo username es 'email'
        });
    }

    // Este método es obligatorio: verifica las credenciales
    async validate(email: string,pass:string):Promise<any>{
        // 💡 Paso: Llamar a una función en AuthService para buscar y validar
        const user = await this.authService.validateUser(email,pass);

        if(!user){
            throw new UnauthorizedException('Credenciales inconrrectas');
        }
// Si la validación es exitosa, Passport añade 'user' al objeto request
        return user;
    }
}