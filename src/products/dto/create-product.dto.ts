import { IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @Type(() => String)  
  @IsString()
  code: string;

  @Type(() => String)  
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
  percentage_gain?: number;

  @IsString()
  @IsOptional()
  url_image?: string;
}