import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Role } from './entities/role.entity';
import { UsersSeeder } from './users.seeder';

@Module({
    imports: [TypeOrmModule.forFeature([User,Role])],
    providers: [UsersService, UsersSeeder],
    exports: [UsersService],
})
export class UsersModule {}
