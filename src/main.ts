import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup validation
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
