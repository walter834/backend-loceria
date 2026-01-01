import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SaleDetail } from "./sale-detail.entity";

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type: 'decimal', precision: 10, scale: 2})
    total: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => SaleDetail, (detail) => detail.sale, { cascade: true })
    details: SaleDetail[];

    @ManyToOne(() => User, { eager: true })
    user: User; // Para saber qué usuario realizó la venta
}
