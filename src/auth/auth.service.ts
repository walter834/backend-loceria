import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

interface UpdateUserDto{
    hashedRefreshToken?: string | null;
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async findByEmail(email:string):Promise<User | undefined>{
        return this.userRepository.findOne({where: {email}});
    }

    async findById(id:number): Promise<User | undefined>{
      return this.userRepository.findOne({where: {id}})  
    }

    async create(UserData:Partial<User>): Promise<User>{
        const newUser = this.userRepository.create(userData);
        return this.userRepository.save(newUser);
    }

    async update(id:number,updateData:UpdateUserDto){
        await this.userRepository.update(id,updateData)
    }

    // dlos dos ultimos me da flojera ir a domir mememem
}
