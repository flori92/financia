import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationType } from '../interfaces/notification.interface';

@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true
    }
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private userSockets: Map<string, Set<string>> = new Map();
    private companySockets: Map<string, Set<string>> = new Map();

    constructor(private jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const { userId, companyId } = payload;

            // Stocker la socket pour l'utilisateur
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(client.id);

            // Stocker la socket pour l'entreprise
            if (companyId) {
                if (!this.companySockets.has(companyId)) {
                    this.companySockets.set(companyId, new Set());
                }
                this.companySockets.get(companyId).add(client.id);
            }

            // Joindre les rooms spécifiques
            client.join(`user:${userId}`);
            if (companyId) {
                client.join(`company:${companyId}`);
            }

            client.emit('connected', { status: 'connected', userId });
        } catch (error) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Nettoyer les références de socket
        this.userSockets.forEach((sockets, userId) => {
            if (sockets.has(client.id)) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(userId);
                }
            }
        });

        this.companySockets.forEach((sockets, companyId) => {
            if (sockets.has(client.id)) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.companySockets.delete(companyId);
                }
            }
        });
    }

    async sendToUser(userId: string, type: NotificationType, data: any) {
        this.server.to(`user:${userId}`).emit('notification', {
            type,
            data,
            timestamp: new Date()
        });
    }

    async sendToCompany(companyId: string, type: NotificationType, data: any) {
        this.server.to(`company:${companyId}`).emit('notification', {
            type,
            data,
            timestamp: new Date()
        });
    }

    async broadcastBankingUpdate(companyId: string, update: any) {
        this.server.to(`company:${companyId}`).emit('banking:update', {
            type: 'banking_update',
            data: update,
            timestamp: new Date()
        });
    }

    async notifyReconciliationMatch(companyId: string, match: any) {
        this.server.to(`company:${companyId}`).emit('reconciliation:match', {
            type: 'reconciliation_match',
            data: match,
            timestamp: new Date()
        });
    }

    async notifyTransactionSync(companyId: string, status: any) {
        this.server.to(`company:${companyId}`).emit('transaction:sync', {
            type: 'transaction_sync',
            data: status,
            timestamp: new Date()
        });
    }

    async notifyBalanceUpdate(companyId: string, accountId: string, balance: any) {
        this.server.to(`company:${companyId}`).emit('balance:update', {
            type: 'balance_update',
            data: { accountId, ...balance },
            timestamp: new Date()
        });
    }

    getUsersOnline(companyId?: string): number {
        if (companyId) {
            return this.companySockets.get(companyId)?.size || 0;
        }
        return [...this.userSockets.values()].reduce((acc, set) => acc + set.size, 0);
    }

    isUserOnline(userId: string): boolean {
        return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
    }
}