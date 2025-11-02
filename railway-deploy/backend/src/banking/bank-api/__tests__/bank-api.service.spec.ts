import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bull';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { BankApiService } from '../services/bank-api.service';
import { BankConnection } from '../entities/bank-connection.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { BankAnomaly } from '../entities/bank-anomaly.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { AIService } from '../../ai/ai.service';
import { CreateBankConnectionDto } from '../dto/bank-api.dto';
import { BankApiException } from '../exceptions/bank-api.exception';

describe('BankApiService', () => {
    let service: BankApiService;
    let bankConnectionRepo: Repository<BankConnection>;
    let bankAccountRepo: Repository<BankAccount>;
    let notificationsService: NotificationsService;
    let aiService: AIService;
    let bankSyncQueue: Queue;

    const mockBankProvider = {
        initializeAuth: jest.fn(),
        exchangeAuthCode: jest.fn(),
        fetchAccounts: jest.fn(),
        fetchTransactions: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BankApiService,
                {
                    provide: getRepositoryToken(BankConnection),
                    useClass: Repository
                },
                {
                    provide: getRepositoryToken(BankAccount),
                    useClass: Repository
                },
                {
                    provide: getRepositoryToken(BankTransaction),
                    useClass: Repository
                },
                {
                    provide: getRepositoryToken(BankAnomaly),
                    useClass: Repository
                },
                {
                    provide: getQueueToken('bank-sync'),
                    useValue: {
                        add: jest.fn()
                    }
                },
                {
                    provide: 'BANK_API_PROVIDERS',
                    useValue: {
                        ECOBANK: () => Promise.resolve({ default: () => mockBankProvider })
                    }
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            switch (key) {
                                case 'BANK_ECOBANK_CLIENT_ID':
                                    return 'test-client-id';
                                case 'BANK_ECOBANK_CLIENT_SECRET':
                                    return 'test-client-secret';
                                case 'BANK_API_REDIRECT_URI':
                                    return 'http://localhost:3000/callback';
                                default:
                                    return '';
                            }
                        })
                    }
                },
                {
                    provide: NotificationsService,
                    useValue: {
                        sendBankConnectionNotification: jest.fn()
                    }
                },
                {
                    provide: AIService,
                    useValue: {
                        analyzeBankTransaction: jest.fn()
                    }
                }
            ]
        }).compile();

        service = module.get<BankApiService>(BankApiService);
        bankConnectionRepo = module.get<Repository<BankConnection>>(
            getRepositoryToken(BankConnection)
        );
        bankAccountRepo = module.get<Repository<BankAccount>>(
            getRepositoryToken(BankAccount)
        );
        notificationsService = module.get<NotificationsService>(NotificationsService);
        aiService = module.get<AIService>(AIService);
        bankSyncQueue = module.get<Queue>(getQueueToken('bank-sync'));
    });

    describe('initializeConnection', () => {
        it('devrait initialiser une nouvelle connexion bancaire', async () => {
            // Mock des réponses
            const mockAuthResult = {
                authorizationUrl: 'https://bank.test/auth',
                state: 'test-state'
            };
            mockBankProvider.initializeAuth.mockResolvedValue(mockAuthResult);

            jest.spyOn(bankConnectionRepo, 'create').mockReturnValue({
                userId: 'test-user',
                bankCode: 'ECOBANK',
                status: 'pending_auth',
                metadata: {
                    authUrl: mockAuthResult.authorizationUrl,
                    state: mockAuthResult.state
                }
            } as BankConnection);

            jest.spyOn(bankConnectionRepo, 'save').mockResolvedValue({
                id: 'test-connection-id',
                userId: 'test-user',
                bankCode: 'ECOBANK',
                status: 'pending_auth',
                metadata: {
                    authUrl: mockAuthResult.authorizationUrl,
                    state: mockAuthResult.state
                }
            } as BankConnection);

            // Exécution du test
            const dto: CreateBankConnectionDto = {
                userId: 'test-user',
                bankCode: 'ECOBANK'
            };

            const result = await service.initializeConnection(dto);

            // Vérifications
            expect(mockBankProvider.initializeAuth).toHaveBeenCalled();
            expect(bankConnectionRepo.create).toHaveBeenCalled();
            expect(bankConnectionRepo.save).toHaveBeenCalled();
            expect(notificationsService.sendBankConnectionNotification).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.status).toBe('pending_auth');
            expect(result.bankCode).toBe('ECOBANK');
        });

        it('devrait gérer les erreurs lors de l\'initialisation', async () => {
            mockBankProvider.initializeAuth.mockRejectedValue(new Error('API Error'));

            const dto: CreateBankConnectionDto = {
                userId: 'test-user',
                bankCode: 'ECOBANK'
            };

            await expect(service.initializeConnection(dto)).rejects.toThrow(BankApiException);
        });
    });

    describe('completeAuthentication', () => {
        it('devrait finaliser l\'authentification bancaire', async () => {
            // Mock des réponses
            const mockTokens = {
                accessToken: 'test-access-token',
                refreshToken: 'test-refresh-token',
                expiresIn: 3600
            };
            mockBankProvider.exchangeAuthCode.mockResolvedValue(mockTokens);

            const mockConnection = {
                id: 'test-connection-id',
                bankCode: 'ECOBANK',
                status: 'pending_auth'
            };

            jest.spyOn(bankConnectionRepo, 'findOneOrFail').mockResolvedValue(
                mockConnection as BankConnection
            );

            jest.spyOn(bankConnectionRepo, 'save').mockImplementation(
                async (connection) => connection as BankConnection
            );

            mockBankProvider.fetchAccounts.mockResolvedValue([
                {
                    id: 'test-account-1',
                    name: 'Test Account',
                    type: 'current',
                    currency: 'XOF',
                    balance: 1000.00
                }
            ]);

            // Exécution du test
            const result = await service.completeAuthentication(
                'test-connection-id',
                'test-auth-code'
            );

            // Vérifications
            expect(mockBankProvider.exchangeAuthCode).toHaveBeenCalledWith('test-auth-code');
            expect(bankConnectionRepo.save).toHaveBeenCalled();
            expect(mockBankProvider.fetchAccounts).toHaveBeenCalled();
            expect(result).toBeDefined();
            expect(result.status).toBe('active');
        });

        it('devrait gérer les erreurs lors de la finalisation', async () => {
            mockBankProvider.exchangeAuthCode.mockRejectedValue(new Error('Invalid code'));

            jest.spyOn(bankConnectionRepo, 'findOneOrFail').mockResolvedValue({
                id: 'test-connection-id',
                bankCode: 'ECOBANK',
                status: 'pending_auth'
            } as BankConnection);

            await expect(
                service.completeAuthentication('test-connection-id', 'invalid-code')
            ).rejects.toThrow(BankApiException);
        });
    });
});