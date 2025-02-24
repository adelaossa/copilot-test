import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { ProductsSeeder } from './products/products.seeder';
import { InvoicesSeeder } from './invoices/invoices.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup validation
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger
  setupSwagger(app);

  if (process.env.NODE_ENV === 'development') {
    // Seed products first
    const productsSeeder = app.get(ProductsSeeder);
    await productsSeeder.seed();

    // Then seed invoices
    const invoicesSeeder = app.get(InvoicesSeeder);
    await invoicesSeeder.seed();
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
