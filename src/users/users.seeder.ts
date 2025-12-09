import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { Repository } from "typeorm";
import { permission } from "process";

@Injectable()
export class UsersSeeder implements OnModuleInit {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async onModuleInit() {
        await this.seedRoles();
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
}