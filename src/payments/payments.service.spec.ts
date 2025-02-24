import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { InvoiceItem } from '../invoices/entities/invoice-item.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentDistributionType, ItemDistributionType } from './types/payment-distribution.types';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentRepository: any;
  let mockInvoiceRepository: any;
  let mockQueryRunner: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockPaymentRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockInvoiceRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
      },
    };

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentRepository,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockInvoiceRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should distribute payment and update remaining amounts correctly', async () => {
    // Setup test data
    const invoice1Items = [
      { id: 1, remainingAmount: 60 },
      { id: 2, remainingAmount: 40 },
    ];

    const invoice2Items = [
      { id: 3, remainingAmount: 30 },
      { id: 4, remainingAmount: 20 },
    ];

    const invoice1 = {
      id: 1,
      remainingAmount: 100,
      dueDate: new Date('2023-01-01'),
      items: invoice1Items
    };

    const invoice2 = {
      id: 2,
      remainingAmount: 50,
      dueDate: new Date('2023-01-02'),
      items: invoice2Items
    };

    const createPaymentDto: CreatePaymentDto = {
      amount: 90,
      method: PaymentMethod.CREDIT_CARD,
      invoiceIds: [1, 2],
      distributionType: PaymentDistributionType.PROPORTIONAL,
      itemDistributionType: ItemDistributionType.PROPORTIONAL,
    };

    // Mock findOne for invoices
    mockQueryRunner.manager.findOne
      .mockImplementation((entity, options) => {
        const id = options.where.id;
        return Promise.resolve(id === 1 ? invoice1 : invoice2);
      });

    // Mock find for invoice items
    mockQueryRunner.manager.find
      .mockImplementation((entity, options) => {
        const invoiceId = options.where.invoice.id;
        return Promise.resolve(invoiceId === 1 ? invoice1Items : invoice2Items);
      });

    // Mock save operations
    mockQueryRunner.manager.save
      .mockImplementation((entity) => Promise.resolve(entity));

    // Execute payment creation
    const result = await service.createPayment(createPaymentDto);

    // Verify transaction handling
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();

    // Verify invoice remaining amounts were updated
    expect(mockQueryRunner.manager.save).toHaveBeenCalled();
    
    // Verify payment was created with correct distribution
    expect(result).toBeDefined();
    expect(result.amount).toBe(90);
    expect(result.status).toBe(PaymentStatus.COMPLETED);
    expect(result.method).toBe(PaymentMethod.CREDIT_CARD);
    expect(result.distributionType).toBe(PaymentDistributionType.PROPORTIONAL);
    expect(result.itemDistributionType).toBe(ItemDistributionType.PROPORTIONAL);
    
    // Verify payment distribution was calculated correctly
    expect(result.paymentDistribution).toBeDefined();
    expect(result.paymentDistribution.length).toBe(2);

    // Verify the proportional distribution
    const firstInvoiceProportion = 100 / 150; // 100 is remaining amount of invoice1, 150 is total
    const secondInvoiceProportion = 50 / 150;  // 50 is remaining amount of invoice2
    
    const expectedFirstInvoiceAmount = 90 * firstInvoiceProportion;
    const expectedSecondInvoiceAmount = 90 * secondInvoiceProportion;

    expect(result.paymentDistribution[0].appliedAmount).toBeCloseTo(expectedFirstInvoiceAmount, 2);
    expect(result.paymentDistribution[1].appliedAmount).toBeCloseTo(expectedSecondInvoiceAmount, 2);
  });

  it('should throw BadRequestException when payment amount exceeds remaining amount', async () => {
    const invoice = {
      id: 1,
      remainingAmount: 50,
      items: [{ id: 1, remainingAmount: 50 }],
    };

    const createPaymentDto: CreatePaymentDto = {
      amount: 100,
      method: PaymentMethod.CREDIT_CARD,
      invoiceIds: [1],
      distributionType: PaymentDistributionType.PROPORTIONAL,
      itemDistributionType: ItemDistributionType.PROPORTIONAL,
    };

    mockQueryRunner.manager.findOne.mockResolvedValue(invoice);

    await expect(service.createPayment(createPaymentDto)).rejects.toThrow(BadRequestException);
  });
});