import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name:string;

    @Column("simple-array")
    permissions: string[]; // ['user:create', 'user:read', 'sales:create']
}