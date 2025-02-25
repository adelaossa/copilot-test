import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from './entities/client.entity';
import { ClientsResolver } from './clients.resolver';
import { AuthModule } from '../auth/auth.module';
import { ClientsSeeder } from './clients.seeder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    AuthModule
  ],
  providers: [ClientsService, ClientsResolver, ClientsSeeder],
  controllers: [ClientsController],
  exports: [ClientsService, ClientsSeeder],
})
export class ClientsModule {}