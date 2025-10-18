export class BankApiException extends Error {
    constructor(message: string, public readonly originalError?: Error) {
        super(message);
        this.name = 'BankApiException';
    }
}