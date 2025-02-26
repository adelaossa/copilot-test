import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find({ relations: ['products'] });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({ 
      where: { id },
      relations: ['products']
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} was not found`);
    }
    return supplier;
  }

  create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.suppliersRepository.create(createSupplierDto);
    return this.suppliersRepository.save(supplier);
  }

  async update(id: number, updateSupplierDto: Partial<CreateSupplierDto>): Promise<Supplier> {
    await this.suppliersRepository.update(id, updateSupplierDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.suppliersRepository.delete(id);
  }
}