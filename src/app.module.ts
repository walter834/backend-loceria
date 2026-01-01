import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Role } from './users/entities/role.entity';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    // 1. Configuración de Variables de Entorno (Global)
    ConfigModule.forRoot({
      isGlobal: true, // Disponible en toda la app sin reimportar
    }),

    // 2. Base de Datos Asíncrona (Para leer variables de entorno antes de conectar)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User,Role,Product],
        // ⚠️ En producción real, 'synchronize' debe ser FALSE. Usar migraciones.
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    UsersModule,
    AuthModule,
    ProductsModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}