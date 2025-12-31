import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  code: string;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsNumber()
  purchase_price: number;

  @Type(() => Number)
  @IsNumber()
  sale_price: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  percentage_gain?: number; // Asegúrate de que coincida con la Entity
}