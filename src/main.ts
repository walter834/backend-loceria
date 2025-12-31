import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // 1. Cambiamos a NestExpressApplication para usar archivos estáticos
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 2. Configuración de Validaciones Globales
  // Esto es vital para que @Type(() => Number) convierta los strings del form-data a números
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, 
  }));

  // 3. Interceptor para ocultar campos como 'password' o 'hashedRefreshToken'
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // 4. Servir archivos estáticos (Imágenes)
  // Esto permite que veas las fotos en: http://localhost:3000/uploads/products/nombre.jpg
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();