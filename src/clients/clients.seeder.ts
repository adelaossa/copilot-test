import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { Client } from './entities/client.entity';

@Injectable()
export class ClientsSeeder {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async seed(count: number = 10) {
    // Check if clients already exist
    const existingCount = await this.clientsRepository.count();
    if (existingCount > 0) {
      console.log('⏩ Clients already exist, skipping seeding');
      return;
    }
    
    console.log('🌱 Seeding clients...');
    
    const clients: Client[] = [];

    for (let i = 0; i < count; i++) {
      const client = new Client();
      client.name = faker.company.name();
      client.email = faker.internet.email();
      client.phone = faker.phone.number();
      client.address = faker.location.streetAddress(true);
      client.taxId = faker.finance.accountNumber();
      client.isActive = true;

      clients.push(client);
    }

    await this.clientsRepository.save(clients);
    console.log(`✅ Successfully seeded ${count} clients`);
  }

  async clear() {
    await this.clientsRepository.clear();
    console.log('🧹 Cleared all clients');
  }
}