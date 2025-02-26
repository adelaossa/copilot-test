import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { ProductsSeeder } from './products/products.seeder';
import { ClientsSeeder } from './clients/clients.seeder';
import { InvoicesSeeder } from './invoices/invoices.seeder';
import { SuppliersSeeder } from './products/suppliers.seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Setup validation
  app.useGlobalPipes(new ValidationPipe());

  // Setup Swagger
  setupSwagger(app);

  if (process.env.NODE_ENV === 'development') {
    // First seed suppliers
    const suppliersSeeder = app.get(SuppliersSeeder);
    await suppliersSeeder.seed();
    
    // Then seed products
    const productsSeeder = app.get(ProductsSeeder);
    await productsSeeder.seed();

    // Then seed clients
    const clientsSeeder = app.get(ClientsSeeder);
    await clientsSeeder.seed();

    // Finally seed invoices
    const invoicesSeeder = app.get(InvoicesSeeder);
    await invoicesSeeder.seed();
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
