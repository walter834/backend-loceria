import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { DataSource, Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { SaleDetail } from './entities/sale-detail.entity';

@Injectable()
export class SalesService {

  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private dataSource: DataSource,
  ) { }

 async create(createSaleDto: CreateSaleDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      const sale = new Sale();
      sale.user = user;
      sale.details = [];

      for (const item of createSaleDto.items) {
        const product = await this.productRepository.findOneBy({ id: item.productId });
        if (!product) throw new NotFoundException(`Producto ${item.productId} no encontrado`);

        const detail = new SaleDetail();
        detail.product = product;
        detail.quantity = item.quantity;
        detail.price_at_sale = product.sale_price; // Usa el sale_price de la entidad Product
        
        total += Number(product.sale_price) * item.quantity;
        sale.details.push(detail);
      }

      sale.total = total;
      const savedSale = await queryRunner.manager.save(sale);
      await queryRunner.commitTransaction();
      return savedSale;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.saleRepository.find({ relations: ['details', 'user'] });
  }

  findOne(id: number) {
    return this.saleRepository.findOne({ where: { id }, relations: ['details', 'user'] });
  }

  remove(id: number) {
    return this.saleRepository.delete(id);
  }
}
