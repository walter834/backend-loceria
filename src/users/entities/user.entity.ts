import { Exclude } from "class-transformer";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";

@Entity('users')

export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    @Exclude()
    @Column({ type: 'varchar', nullable: true })
    hashedRefreshToken: string | null;

    @ManyToOne(() => Role)
    role: Role;
}