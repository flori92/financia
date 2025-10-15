import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MobileMoneyService } from './mobile-money.service';
import { MobileMoneyTransaction } from './entities/mobile-money-transaction.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { KkiapayProvider } from './providers/kkiapay.provider';
import { FedaPayProvider } from './providers/fedapay.provider';
import { NotificationsService } from '../notifications/notifications.service';

describe('MobileMoneyService', () => {
  let service: MobileMoneyService;
  let transactionRepository: any;
  let invoiceRepository: any;
  let paymentRepository: any;
  let kkiapayProvider: KkiapayProvider;
  let notificationsService: NotificationsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    query: jest.fn(),
  };

  const mockKkiapayProvider = {
    generateWidgetConfig: jest.fn(),
    generatePaymentLink: jest.fn(),
    generateQRCodeData: jest.fn(),
    verifyTransaction: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    mapKkiapayStatus: jest.fn(),
  };

  const mockNotificationsService = {
    notifyPaymentSuccess: jest.fn(),
    notifyPaymentFailure: jest.fn(),
    notifyEntrepreneurPaymentReceived: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key, defaultValue) => {
      const config = {
        MOBILE_MONEY_PROVIDER: 'kkiapay',
        MOBILE_MONEY_SANDBOX: true,
        WEB_APP_URL: 'http://localhost:3000',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MobileMoneyService,
        {
          provide: getRepositoryToken(MobileMoneyTransaction),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Invoice),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository,
        },
        {
          provide: KkiapayProvider,
          useValue: mockKkiapayProvider,
        },
        {
          provide: FedaPayProvider,
          useValue: {},
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MobileMoneyService>(MobileMoneyService);
    transactionRepository = module.get(getRepositoryToken(MobileMoneyTransaction));
    invoiceRepository = module.get(getRepositoryToken(Invoice));
    paymentRepository = module.get(getRepositoryToken(Payment));
    kkiapayProvider = module.get<KkiapayProvider>(KkiapayProvider);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    it('should initiate payment with KkiaPay', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'XOF',
        phoneNumber: '+22997123456',
        provider: 'mtn' as const,
        txRef: 'TEST-123',
      };

      const mockTransaction = {
        id: 'transaction-id',
        txRef: 'TEST-123',
        amount: 1000,
        currency: 'XOF',
        phoneNumber: '+22997123456',
        provider: 'mtn',
        status: 'pending',
      };

      const mockWidgetConfig = {
        key: 'test-key',
        amount: 1000,
        position: 'center',
        sandbox: 'true',
        data: '{}',
      };

      mockRepository.create.mockReturnValue(mockTransaction);
      mockRepository.save.mockResolvedValue(mockTransaction);
      mockKkiapayProvider.generateWidgetConfig.mockReturnValue(mockWidgetConfig);
      mockKkiapayProvider.generatePaymentLink.mockReturnValue('https://payment.link');
      mockKkiapayProvider.generateQRCodeData.mockReturnValue('{"qr":"data"}');

      const result = await service.initiatePayment(paymentRequest);

      expect(result).toHaveProperty('transaction_id');
      expect(result).toHaveProperty('provider', 'kkiapay');
      expect(result).toHaveProperty('widget_config');
      expect(result).toHaveProperty('payment_link');
      expect(result).toHaveProperty('qr_code_data');
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle payment with invoice', async () => {
      const paymentRequest = {
        amount: 1000,
        currency: 'XOF',
        phoneNumber: '+22997123456',
        provider: 'mtn' as const,
        txRef: 'TEST-123',
        invoiceId: 'invoice-id',
      };

      const mockInvoice = {
        id: 'invoice-id',
        invoiceNumber: 'INV-001',
        partyName: 'John Doe',
        partyEmail: 'john@example.com',
        partyPhone: '+22997123456',
        companyId: 'company-id',
      };

      mockRepository.findOne.mockResolvedValue(mockInvoice);
      mockRepository.create.mockReturnValue({ id: 'tx-id' });
      mockRepository.save.mockResolvedValue({ id: 'tx-id' });
      mockKkiapayProvider.generateWidgetConfig.mockReturnValue({});
      mockKkiapayProvider.generatePaymentLink.mockReturnValue('link');
      mockKkiapayProvider.generateQRCodeData.mockReturnValue('qr');

      const result = await service.initiatePayment(paymentRequest);

      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invoice-id' },
        relations: ['company'],
      });
    });
  });

  describe('verifyTransaction', () => {
    it('should verify transaction successfully', async () => {
      const mockTransaction = {
        id: 'tx-id',
        externalTransactionId: '123',
        amount: 1000,
        currency: 'XOF',
        provider: 'mtn',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockKkiapayTransaction = {
        transactionId: '123',
        state: 'SUCCESS',
        amount: 1000,
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockKkiapayProvider.verifyTransaction.mockResolvedValue(mockKkiapayTransaction);
      mockKkiapayProvider.mapKkiapayStatus.mockReturnValue('success');
      mockRepository.save.mockResolvedValue({ ...mockTransaction, status: 'success' });

      const result = await service.verifyTransaction('tx-id');

      expect(result).toHaveProperty('transaction_id', 'tx-id');
      expect(result).toHaveProperty('status');
      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('should throw error if transaction not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyTransaction('invalid-id')).rejects.toThrow();
    });
  });

  describe('handleWebhook', () => {
    it('should handle successful payment webhook', async () => {
      const webhookData = {
        entity: 'transaction.approved',
        data: {
          id: '123',
          amount: 1000,
        },
      };

      const mockTransaction = {
        id: 'tx-id',
        externalTransactionId: '123',
        amount: 1000,
        invoiceId: 'inv-id',
        status: 'pending',
        customerEmail: 'test@example.com',
        phoneNumber: '+22997123456',
        customerName: 'Test User',
        invoice: {
          id: 'inv-id',
          invoiceNumber: 'INV-001',
          companyId: 'comp-id',
          partyId: 'party-id',
          company: {
            id: 'comp-id',
          },
        },
      };

      const mockPayment = {
        id: 'payment-id',
        companyId: 'comp-id',
      };

      mockRepository.findOne.mockResolvedValue(mockTransaction);
      mockRepository.create.mockReturnValue(mockPayment);
      mockRepository.save.mockResolvedValue(mockPayment);
      mockRepository.query.mockResolvedValue([{ email: 'owner@example.com', phone: '+22997123456' }]);

      const result = await service.handleWebhook(webhookData);

      expect(result).toHaveProperty('status', 'processed');
      expect(mockNotificationsService.notifyPaymentSuccess).toHaveBeenCalled();
      expect(mockNotificationsService.notifyEntrepreneurPaymentReceived).toHaveBeenCalled();
    });
  });
});
