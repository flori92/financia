import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BankApiModule } from '../bank-api.module';
import { NotificationsModule } from '../../../notifications/notifications.module';
import { AIModule } from '../../../ai/ai.module';
import { AuthModule } from '../../../auth/auth.module';
import { BankConnection } from '../entities/bank-connection.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { BankAnomaly } from '../entities/bank-anomaly.entity';
import { CreateBankConnectionDto } from '../dto/bank-api.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

describe('BankApi (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [() => ({
                        database: {
                            type: 'postgres',
                            host: 'localhost',
                            port: 5432,
                            username: 'test',
                            password: 'test',
                            database: 'test_db',
                            autoLoadEntities: true,
                            synchronize: true
                        },
                        redis: {
                            host: 'localhost',
                            port: 6379
                        }
                    })]
                }),
                TypeOrmModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: async (config: ConfigService) => ({
                        ...config.get('database')
                    })
                }),
                BullModule.forRootAsync({
                    inject: [ConfigService],
                    useFactory: async (config: ConfigService) => ({
                        redis: config.get('redis')
                    })
                }),
                BankApiModule,
                NotificationsModule,
                AIModule,
                AuthModule
            ]
        })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => true })
        .compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        // Simuler l'authentification pour obtenir un token JWT
        jwtToken = 'test-jwt-token';
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/api/banking/connections (POST)', () => {
        it('devrait créer une nouvelle connexion bancaire', async () => {
            const dto: CreateBankConnectionDto = {
                userId: 'test-user',
                bankCode: 'ECOBANK'
            };

            const response = await request(app.getHttpServer())
                .post('/api/banking/connections')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(dto)
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body.status).toBe('pending_auth');
            expect(response.body.metadata.authUrl).toBeDefined();
        });

        it('devrait rejeter une requête sans token', () => {
            const dto: CreateBankConnectionDto = {
                userId: 'test-user',
                bankCode: 'ECOBANK'
            };

            return request(app.getHttpServer())
                .post('/api/banking/connections')
                .send(dto)
                .expect(401);
        });
    });

    describe('/api/banking/connections/:connectionId/auth (PUT)', () => {
        it('devrait finaliser l\'authentification bancaire', async () => {
            // Créer d'abord une connexion
            const connection = await request(app.getHttpServer())
                .post('/api/banking/connections')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    userId: 'test-user',
                    bankCode: 'ECOBANK'
                });

            const response = await request(app.getHttpServer())
                .put(`/api/banking/connections/${connection.body.id}/auth`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .query({ code: 'test-auth-code' })
                .expect(200);

            expect(response.body).toBeDefined();
            expect(response.body.status).toBe('active');
        });
    });

    describe('/api/banking/accounts/:accountId/transactions (POST)', () => {
        it('devrait synchroniser les transactions d\'un compte', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/banking/accounts/test-account/sync-transactions')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                })
                .expect(201);

            expect(response.body).toBeDefined();
            expect(response.body.message).toBe('Synchronisation des transactions réussie');
        });
    });

    describe('/api/banking/accounts/:accountId/transactions (GET)', () => {
        it('devrait récupérer les transactions d\'un compte', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/banking/accounts/test-account/transactions')
                .set('Authorization', `Bearer ${jwtToken}`)
                .query({ limit: 10 })
                .expect(200);

            expect(response.body).toBeDefined();
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('/api/banking/accounts/:accountId/anomalies (GET)', () => {
        it('devrait récupérer les anomalies d\'un compte', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/banking/accounts/test-account/anomalies')
                .set('Authorization', `Bearer ${jwtToken}`)
                .query({ status: 'pending' })
                .expect(200);

            expect(response.body).toBeDefined();
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('/api/banking/anomalies/:anomalyId (PUT)', () => {
        it('devrait mettre à jour une anomalie', async () => {
            const response = await request(app.getHttpServer())
                .put('/api/banking/anomalies/test-anomaly')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    status: 'reviewed',
                    resolution: 'Transaction validée après vérification'
                })
                .expect(200);

            expect(response.body).toBeDefined();
            expect(response.body.status).toBe('reviewed');
            expect(response.body.resolution).toBeDefined();
            expect(response.body.reviewedAt).toBeDefined();
        });
    });
});