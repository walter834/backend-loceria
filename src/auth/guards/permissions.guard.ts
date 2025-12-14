import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Obtener el permiso requerido desde el decorador
    const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta no tiene el decorador, permitimos el acceso (o usamos AuthGuard básico)
    if (!requiredPermission) {
      return true;
    }

    // 2. Obtener el usuario desde la Request (Inyectado previamente por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();
    
    // Validar que el usuario exista y tenga rol
    if (!user || !user.role || !user.role.permissions) {
      throw new ForbiddenException('Usuario sin roles asignados');
    }

    // 3. Verificar si el array de permisos del rol contiene el permiso requerido
    const hasPermission = user.role.permissions.includes(requiredPermission);

    if (!hasPermission) {
        throw new ForbiddenException(`No tienes permiso para realizar esta acción: ${requiredPermission}`);
    }

    return true;
  }
}