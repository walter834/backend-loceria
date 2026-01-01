import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermission } from 'src/auth/decorators/require-permission.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

const storage = diskStorage({
  destination: './uploads/products',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @RequirePermission('products:create')
  @UseInterceptors(FileInterceptor('url_image', { storage }))
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const url_image = file ? `/uploads/products/${file.filename}` : undefined;
    return this.productsService.create({ ...createProductDto, url_image });
  }

  @Get()
  @RequirePermission('products:read')
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @RequirePermission('products:read')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @RequirePermission('products:update')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @RequirePermission('products:delete')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
