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

export interface BankAccount {
    accountId: string;
    connectionId: string;
    type: string;
    subtype: string;
    name: string;
    officialName?: string;
    currency: string;
    balance: {
        current: number;
        available: number;
        limit?: number;
    };
    iban?: string;
    bic?: string;
    mask: string;
    lastUpdate: string;
}

export interface BankTransaction {
    transactionId: string;
    accountId: string;
    amount: number;
    currency: string;
    date: string;
    description: string;
    category?: string;
    type: string;
    status: 'pending' | 'posted' | 'cancelled';
    merchantName?: string;
    merchantId?: string;
    location?: {
        address?: string;
        city?: string;
        country?: string;
        postalCode?: string;
    };
    reference?: string;
    metadata?: Record<string, any>;
}