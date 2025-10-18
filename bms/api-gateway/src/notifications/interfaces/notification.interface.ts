export type NotificationType = 
    | 'banking_update'
    | 'reconciliation_match'
    | 'transaction_sync'
    | 'balance_update'
    | 'anomaly_detected'
    | 'system_alert'
    | 'task_completed'
    | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    userId?: string;
    companyId?: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface NotificationPreferences {
    userId: string;
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
    notificationTypes: {
        [key in NotificationType]: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    };
}