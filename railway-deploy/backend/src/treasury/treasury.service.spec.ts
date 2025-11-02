import { TreasuryService } from './treasury.service';

// Minimal mock types
type Payment = any;

describe('TreasuryService.getForecast', () => {
  const now = new Date();
  const mkDate = (daysAgo: number) => new Date(now.getTime() - daysAgo * 24 * 3600 * 1000);

  const last30: Payment[] = [
    // 5 encaissements de 2000 et 5 décaissements de 1000 dans les 30 derniers jours
    { paymentDate: mkDate(2), amount: 2000, partyType: 'customer' },
    { paymentDate: mkDate(5), amount: 2000, partyType: 'customer' },
    { paymentDate: mkDate(8), amount: 2000, partyType: 'customer' },
    { paymentDate: mkDate(12), amount: 2000, partyType: 'customer' },
    { paymentDate: mkDate(20), amount: 2000, partyType: 'customer' },

    { paymentDate: mkDate(1), amount: 1000, partyType: 'supplier' },
    { paymentDate: mkDate(7), amount: 1000, partyType: 'supplier' },
    { paymentDate: mkDate(9), amount: 1000, partyType: 'supplier' },
    { paymentDate: mkDate(15), amount: 1000, partyType: 'supplier' },
    { paymentDate: mkDate(25), amount: 1000, partyType: 'supplier' },
  ];
  const all: Payment[] = [...last30];

  const paymentsRepo = {
    find: jest.fn().mockImplementation((opts: any) => {
      if (opts?.where?.paymentDate) return last30;
      return all;
    }),
  } as any;

  const notificationsService = {
    notifyTreasuryAlert: jest.fn(),
  } as any;

  const service = new TreasuryService(paymentsRepo, notificationsService);

  it('should return 7 forecast points with confidence and recommendations', async () => {
    const res = await service.getForecast('company-1', 7);
    expect(res).toBeDefined();
    expect(res.horizon).toBe(7);
    expect(Array.isArray(res.points)).toBe(true);
    expect(res.points.length).toBe(7);
    expect(typeof res.confidence).toBe('number');
    expect(res.confidence).toBeGreaterThanOrEqual(0.2);
    expect(res.confidence).toBeLessThanOrEqual(0.95);
    expect(res.points[0]).toHaveProperty('date');
    expect(res.points[0]).toHaveProperty('in');
    expect(res.points[0]).toHaveProperty('out');
    expect(res.points[0]).toHaveProperty('net');
    expect(res.points[0]).toHaveProperty('projectedBalance');
  });
});
