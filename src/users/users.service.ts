import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
    }

    async updateRefreshToken(id: number, hashedRefreshToken: string): Promise<void> {
        await this.userRepository.update(id, { hashedRefreshToken });
    }

    async findRoleByName(name: string): Promise<Role | null> {
        // Necesitas inyectar el repositorio de Role en el constructor de UsersService también
        return this.roleRepository.findOne({ where: { name } });
    }

    async update(id: number, updateUserDto: Partial<User>): Promise<User> {
        await this.userRepository.update(id, updateUserDto);

        const user = await this.userRepository.findOne({ where: { id } });

        // 3. Validación de seguridad: Si no existe, lanzamos error en lugar de devolver null
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }

        return user; // Ahora TypeScript sabe que 'user' NO es null
    }

}
