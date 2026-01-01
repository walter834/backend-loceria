import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto) {
    try {
      const newProduct = this.productRepository.create(createProductDto);
      return await this.productRepository.save(newProduct);
    } catch (error) {
      // Error 23505 = violación de constraint único en PostgreSQL
      if (error.code === '23505') {
        throw new ConflictException('Ya existe un producto con ese código');
      }
      throw error; // Si es otro error, lo relanza
    }
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`); // 👈 Mejor manejo de errores
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    // Usamos preload para que nos devuelva el objeto actualizado completo
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return await this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id); // Reutilizamos findOne para validar que existe
    return await this.productRepository.remove(product);
  }
}
