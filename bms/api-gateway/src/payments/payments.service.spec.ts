import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentsRepository: Repository<Payment>;
  let allocationsRepository: Repository<PaymentAllocation>;

  const mockPaymentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockAllocationsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockPaymentsRepository,
        },
        {
          provide: getRepositoryToken(PaymentAllocation),
          useValue: mockAllocationsRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentsRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    allocationsRepository = module.get<Repository<PaymentAllocation>>(
      getRepositoryToken(PaymentAllocation),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('devrait créer un paiement sans allocations', async () => {
      const createDto = {
        paymentDate: '2025-10-15',
        amount: 100000,
        paymentMethod: 'mobile_money',
        partyType: 'customer',
        partyId: 'customer-123',
        companyId: 'company-123',
        createdBy: 'user-123',
      };

      const payment = {
        id: 'payment-123',
        paymentNumber: 'REC-202510-0001',
        ...createDto,
        allocatedAmount: 0,
        unallocatedAmount: 100000,
      };

      mockPaymentsRepository.count.mockResolvedValue(0);
      mockPaymentsRepository.create.mockReturnValue(payment);
      mockPaymentsRepository.save.mockResolvedValue(payment);
      mockPaymentsRepository.findOne.mockResolvedValue({
        ...payment,
        allocations: [],
      });

      const result = await service.createPayment(createDto as any);

      expect(result).toBeDefined();
      expect(result.paymentNumber).toBe('REC-202510-0001');
      expect(result.unallocatedAmount).toBe(100000);
    });

    it('devrait créer un paiement avec allocations', async () => {
      const createDto = {
        paymentDate: '2025-10-15',
        amount: 100000,
        paymentMethod: 'mobile_money',
        partyType: 'customer',
        partyId: 'customer-123',
        companyId: 'company-123',
        createdBy: 'user-123',
        allocations: [
          {
            invoiceId: 'invoice-1',
            allocatedAmount: 60000,
          },
          {
            invoiceId: 'invoice-2',
            allocatedAmount: 40000,
          },
        ],
      };

      const payment = {
        id: 'payment-123',
        paymentNumber: 'REC-202510-0001',
        allocatedAmount: 100000,
        unallocatedAmount: 0,
      };

      mockPaymentsRepository.count.mockResolvedValue(0);
      mockPaymentsRepository.create.mockReturnValue(payment);
      mockPaymentsRepository.save.mockResolvedValue(payment);
      mockAllocationsRepository.create.mockImplementation((data) => data);
      mockAllocationsRepository.save.mockResolvedValue([]);
      mockPaymentsRepository.findOne.mockResolvedValue({
        ...payment,
        allocations: [],
      });

      const result = await service.createPayment(createDto as any);

      expect(result).toBeDefined();
      expect(mockAllocationsRepository.save).toHaveBeenCalled();
    });

    it('devrait échouer si montant alloué > montant paiement', async () => {
      const createDto = {
        paymentDate: '2025-10-15',
        amount: 100000,
        paymentMethod: 'mobile_money',
        partyType: 'customer',
        partyId: 'customer-123',
        companyId: 'company-123',
        createdBy: 'user-123',
        allocations: [
          {
            invoiceId: 'invoice-1',
            allocatedAmount: 150000, // Dépasse le montant
          },
        ],
      };

      mockPaymentsRepository.count.mockResolvedValue(0);

      await expect(service.createPayment(createDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findPaymentById', () => {
    it('devrait retourner un paiement existant', async () => {
      const payment = {
        id: 'payment-123',
        paymentNumber: 'REC-202510-0001',
        amount: 100000,
        allocations: [],
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);

      const result = await service.findPaymentById('payment-123');

      expect(result).toEqual(payment);
      expect(mockPaymentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        relations: ['allocations'],
      });
    });

    it('devrait lever une exception si le paiement n\'existe pas', async () => {
      mockPaymentsRepository.findOne.mockResolvedValue(null);

      await expect(service.findPaymentById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('allocatePayment', () => {
    it('devrait allouer un montant à une facture', async () => {
      const payment = {
        id: 'payment-123',
        amount: 100000,
        allocatedAmount: 0,
        unallocatedAmount: 100000,
        allocations: [],
        version: 1,
      };

      const allocateDto = {
        invoiceId: 'invoice-123',
        amount: 50000,
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);
      mockAllocationsRepository.create.mockReturnValue({
        id: 'allocation-123',
        ...allocateDto,
      });
      mockAllocationsRepository.save.mockResolvedValue({});
      mockPaymentsRepository.save.mockResolvedValue({
        ...payment,
        allocatedAmount: 50000,
        unallocatedAmount: 50000,
      });
      mockPaymentsRepository.findOne.mockResolvedValue({
        ...payment,
        allocatedAmount: 50000,
        unallocatedAmount: 50000,
        allocations: [{ id: 'allocation-123' }],
      });

      const result = await service.allocatePayment(
        'payment-123',
        allocateDto as any,
      );

      expect(result.allocatedAmount).toBe(50000);
      expect(result.unallocatedAmount).toBe(50000);
    });

    it('devrait échouer si montant insuffisant', async () => {
      const payment = {
        id: 'payment-123',
        amount: 100000,
        allocatedAmount: 90000,
        unallocatedAmount: 10000,
        allocations: [],
      };

      const allocateDto = {
        invoiceId: 'invoice-123',
        amount: 50000, // Dépasse unallocatedAmount
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);

      await expect(
        service.allocatePayment('payment-123', allocateDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('submitPayment', () => {
    it('devrait valider un paiement en brouillon', async () => {
      const payment = {
        id: 'payment-123',
        status: 'draft',
        version: 1,
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);
      mockPaymentsRepository.save.mockResolvedValue({
        ...payment,
        status: 'submitted',
      });

      const result = await service.submitPayment('payment-123', 'user-123');

      expect(result.status).toBe('submitted');
      expect(mockPaymentsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'submitted',
          submittedBy: 'user-123',
        }),
      );
    });

    it('devrait échouer si le paiement est déjà validé', async () => {
      const payment = {
        id: 'payment-123',
        status: 'submitted',
        allocations: [],
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);

      await expect(
        service.submitPayment('payment-123', 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPaymentsSummary', () => {
    it('devrait générer un récapitulatif des paiements', async () => {
      const payments = [
        {
          id: '1',
          amount: 100000,
          allocatedAmount: 80000,
          unallocatedAmount: 20000,
          paymentMethod: 'mobile_money',
          partyType: 'customer',
          status: 'submitted',
        },
        {
          id: '2',
          amount: 50000,
          allocatedAmount: 50000,
          unallocatedAmount: 0,
          paymentMethod: 'cash',
          partyType: 'customer',
          status: 'submitted',
        },
      ];

      mockPaymentsRepository.find.mockResolvedValue(payments as any);

      const result = await service.getPaymentsSummary(
        'company-123',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result.totalPayments).toBe(2);
      expect(result.totalAmount).toBe(150000);
      expect(result.totalAllocated).toBe(130000);
      expect(result.totalUnallocated).toBe(20000);
      expect(result.byPaymentMethod.mobile_money.count).toBe(1);
      expect(result.byPartyType.customer.count).toBe(2);
    });
  });

  describe('deletePayment', () => {
    it('devrait supprimer un paiement en brouillon', async () => {
      const payment = {
        id: 'payment-123',
        status: 'draft',
        allocations: [],
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);
      mockPaymentsRepository.remove.mockResolvedValue(payment);

      await service.deletePayment('payment-123');

      expect(mockPaymentsRepository.remove).toHaveBeenCalledWith(payment);
    });

    it('devrait échouer si le paiement n\'est pas en brouillon', async () => {
      const payment = {
        id: 'payment-123',
        status: 'submitted',
        allocations: [],
      };

      mockPaymentsRepository.findOne.mockResolvedValue(payment);

      await expect(service.deletePayment('payment-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
