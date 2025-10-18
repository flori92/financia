export enum BankConnectionStatus {
    INITIALIZING = 'initializing',
    PENDING_AUTH = 'pending_auth',
    ACTIVE = 'active',
    ERROR = 'error',
    DISCONNECTED = 'disconnected'
}

export interface BankInfo {
    bankId: string;
    name: string;
    code: string;
    country: string;
}

export interface BankConnectionInit {
    bankId: string;
    userId: string;
    accountType?: 'business' | 'personal';
}

export interface BankAuthComplete {
    connectionId: string;
    authCode: string;
}

export interface BankConnection {
    connectionId: string;
    status: BankConnectionStatus;
    bankInfo: BankConnectionInit;
    lastSync: string | null;
    authUrl?: string;
    accessToken?: string;
    error?: string;
}