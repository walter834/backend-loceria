import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        @InjectRepository(Role)
        private readonly userRepository: Repository<User>,
        private readonly roleRepository: Repository<Role>,
    ){}

    async findByEmail(email:string):Promise<User | null>{
        return this.userRepository.findOne({where: {email}});
    }

    async findById(id:number): Promise<User | null>{
        return this.userRepository.findOne({where: {id}});
    }

    async create(userData:Partial<User>): Promise<User>{
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
    }

    async updateRefreshToken(id:number, hashedRefreshToken:string): Promise<void>{
        await this.userRepository.update(id, { hashedRefreshToken});
    }

    async findRoleByName(name: string): Promise<Role | null> {
    // Necesitas inyectar el repositorio de Role en el constructor de UsersService también
    return this.roleRepository.findOne({ where: { name } }); 
}
}
