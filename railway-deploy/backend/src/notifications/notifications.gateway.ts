import { Module } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private readonly connectedClients = new Map<string, Socket>();

    constructor(private readonly jwtService: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            // Vérifier le token JWT
            const token = client.handshake.auth.token;
            if (!token) {
                this.logger.warn('Client sans token tenté de se connecter');
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            // Stocker la connexion client
            this.connectedClients.set(userId, client);
            client.data.userId = userId;

            this.logger.log(`Client connecté: ${userId}`);

            // Rejoindre la room personnelle
            await client.join(`user:${userId}`);
        } catch (error) {
            this.logger.error('Erreur lors de la connexion client', error.stack);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedClients.delete(userId);
            this.logger.log(`Client déconnecté: ${userId}`);
        }
    }

    @SubscribeMessage('subscribe:accountUpdates')
    async handleAccountSubscription(client: Socket, accountId: string) {
        try {
            // Vérifier les permissions
            const userId = client.data.userId;
            // TODO: Vérifier que l'utilisateur a accès à ce compte

            await client.join(`account:${accountId}`);
            this.logger.log(`Client ${userId} inscrit aux mises à jour du compte ${accountId}`);
        } catch (error) {
            this.logger.error('Erreur lors de l\'inscription aux mises à jour du compte', error.stack);
        }
    }

    @SubscribeMessage('unsubscribe:accountUpdates')
    async handleAccountUnsubscription(client: Socket, accountId: string) {
        await client.leave(`account:${accountId}`);
        this.logger.log(`Client ${client.data.userId} désinscrit des mises à jour du compte ${accountId}`);
    }

    // Méthodes pour envoyer des notifications

    async sendUserNotification(userId: string, notification: {
        type: string;
        title: string;
        message: string;
        data?: any;
    }) {
        this.server.to(`user:${userId}`).emit('notification', notification);
    }

    async sendAccountUpdate(accountId: string, update: {
        type: 'transaction' | 'balance' | 'sync';
        data: any;
    }) {
        this.server.to(`account:${accountId}`).emit('accountUpdate', update);
    }

    async broadcastSystemNotification(notification: {
        type: string;
        title: string;
        message: string;
        severity: 'info' | 'warning' | 'error';
    }) {
        this.server.emit('systemNotification', notification);
    }

    async sendBankingAlert(userId: string, alert: {
        type: 'anomaly' | 'fraud' | 'sync_error';
        accountId: string;
        message: string;
        data: any;
    }) {
        this.server.to(`user:${userId}`).emit('bankingAlert', alert);
    }
}