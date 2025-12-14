import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity'; // 1. Importar User
import * as bcrypt from 'bcrypt'; // 2. Importar bcrypt

@Injectable()
export class UsersSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User) // 3. Inyectar repositorio de usuarios
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
    await this.seedAdminUser(); // 4. Llamar a la función del Admin
  }

  private async seedRoles() {
    const rolesData = [
      {
        name: 'SUPER_ADMIN',
        permissions: [
          'users:create', 'users:read', 'users:update', 'users:delete',
          'sales:create', 'sales:read'
        ],
      },
      {
        name: 'EMPLEADO',
        permissions: [
          'sales:create', 'sales:read'
        ],
      },
    ];

    for (const roleData of rolesData) {
      const existingRole = await this.roleRepository.findOne({ where: { name: roleData.name } });
      if (!existingRole) {
        const newRole = this.roleRepository.create(roleData);
        await this.roleRepository.save(newRole);
        console.log(`✅ Rol creado: ${roleData.name}`);
      }
    }
  }

  // 5. Nueva función para crear el Admin
  private async seedAdminUser() {
    const adminEmail = 'admin@loceria.com';
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      // Buscar el rol SUPER_ADMIN que acabamos de asegurar que existe
      const adminRole = await this.roleRepository.findOne({ where: { name: 'SUPER_ADMIN' } });
      if (!adminRole) {
        console.log('⚠️ Error: No se encontró el rol SUPER_ADMIN. No se pudo crear el usuario administrador.');
        return; 
      }
      // Crear hash de contraseña (ej: 'admin123')
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const newAdmin = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        role: adminRole,
      });

      await this.userRepository.save(newAdmin);
      console.log('👑 Usuario SUPER_ADMIN creado automáticamente');
    }
  }
}