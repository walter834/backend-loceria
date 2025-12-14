import { Exclude } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
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

    @Column({ default: true }) 
    mustChangePassword: boolean;

    @ManyToOne(() => Role, {eager:true})
    @JoinColumn({ name: 'roleId' })
    role: Role;
}