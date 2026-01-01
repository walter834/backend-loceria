import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('sale_details')
export class SaleDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_at_sale: number; // Precio al momento de la venta

  @ManyToOne(() => Sale, (sale) => sale.details)
  sale: Sale;

  @ManyToOne(() => Product, { eager: true })
  product: Product;
}