import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger.config';
import { ProductsSeeder } from './products/products.seeder';
import { ClientsSeeder } from './clients/clients.seeder';
import { InvoicesSeeder } from './invoices/invoices.seeder';
import { SuppliersSeeder } from './products/suppliers.seeder';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
    new I18nValidationPipe()
  );
  
  app.useGlobalFilters(
    new I18nValidationExceptionFilter()
  );

  setupSwagger(app);

  if (process.env.NODE_ENV === 'development') {
    const productsSeeder = app.get(ProductsSeeder);
    const clientsSeeder = app.get(ClientsSeeder);
    const invoicesSeeder = app.get(InvoicesSeeder);
    const suppliersSeeder = app.get(SuppliersSeeder);

    await suppliersSeeder.seed();
    await productsSeeder.seed();
    await clientsSeeder.seed();
    await invoicesSeeder.seed();
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
