import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({ // Add this line
      type: 'postgres',
      host: process.env.DB_HOST,  // Add this line
      port: +(process.env.DB_PORT || 5432),  // Add this line  
      database: process.env.DB_NAME,  // Add this line
      username: process.env.DB_USER,  // Add this line  
      password: process.env.DB_PASS,  // Add this line
      autoLoadEntities: true,
      synchronize: true,
    }),
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
