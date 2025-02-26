import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersSeeder {
  private readonly logger = new Logger(SuppliersSeeder.name);
  
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.suppliersRepository.count();
    
    if (count === 0) {
      this.logger.log('Seeding suppliers...');
      
      const suppliers = [
        {
          name: 'Global Tech Supplies',
          contactPerson: 'John Smith',
          email: 'john.smith@globaltechsupplies.com',
          phone: '+1-555-123-4567',
          address: '123 Tech Blvd, San Francisco, CA 94105',
        },
        {
          name: 'Office Solutions Inc',
          contactPerson: 'Sarah Johnson',
          email: 'sarah@officesolutions.com',
          phone: '+1-555-987-6543',
          address: '456 Office Way, Chicago, IL 60601',
        },
        {
          name: 'Electronics Wholesale',
          contactPerson: 'David Chen',
          email: 'david@electronicswholesale.com',
          phone: '+1-555-222-3333',
          address: '789 Electronic Ave, Austin, TX 78701',
        },
      ];
      
      await this.suppliersRepository.save(suppliers);
      this.logger.log(`Seeded ${suppliers.length} suppliers`);
    } else {
      this.logger.log('Suppliers already seeded');
    }
  }
}