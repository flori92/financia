import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { NotificationsService } from '../notifications/notifications.service';

function parseDate(d: string | Date): Date { return d instanceof Date ? d : new Date(d); }
function ym(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; }
function ymd(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

@Injectable()
export class TreasuryService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getSummary(companyId: string, startDate: string, endDate: string) {
    if (!companyId || !startDate || !endDate) throw new BadRequestException('companyId, startDate, endDate requis');
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const prior = await this.paymentsRepo.find({
      where: { companyId, paymentDate: LessThan(start) },
    });

    const inPrior = prior.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + Number(p.amount||0), 0);
    const outPrior = prior.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + Number(p.amount||0), 0);
    const openingBalance = inPrior - outPrior;

    const range = await this.paymentsRepo.find({
      where: { companyId, paymentDate: Between(start, end) },
      order: { paymentDate: 'ASC' },
    });

    const inAmount = range.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + Number(p.amount||0), 0);
    const outAmount = range.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + Number(p.amount||0), 0);
    const net = inAmount - outAmount;

    // Regroupement par mode de paiement et statut
    const byPaymentMethod: Record<string,{count:number,amount:number}> = {};
    const byStatus: Record<string,{count:number,amount:number}> = {};
    for (const p of range) {
      const m = p.paymentMethod||'other';
      byPaymentMethod[m] = byPaymentMethod[m] || { count: 0, amount: 0 };
      byPaymentMethod[m].count++; byPaymentMethod[m].amount += Number(p.amount||0);
      const st = p.status||'draft';
      byStatus[st] = byStatus[st] || { count: 0, amount: 0 };
      byStatus[st].count++; byStatus[st].amount += Number(p.amount||0);
    }

    return {
      openingBalance,
      in: { count: range.filter(p=> (p.partyType||'customer')==='customer').length, amount: inAmount },
      out: { count: range.filter(p=> p.partyType==='supplier').length, amount: outAmount },
      net,
      closingBalance: openingBalance + net,
      byPaymentMethod,
      byStatus,
    };
  }

  async getTimeseries(companyId: string, startDate: string, endDate: string, granularity: 'day'|'month' = 'month') {
    if (!companyId || !startDate || !endDate) throw new BadRequestException('companyId, startDate, endDate requis');
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    const range = await this.paymentsRepo.find({
      where: { companyId, paymentDate: Between(start, end) },
      order: { paymentDate: 'ASC' },
    });

    const keyFn = granularity === 'day' ? (d: Date)=> ymd(d) : (d: Date)=> ym(d);
    const map: Record<string,{in:number,out:number,net:number,cumulative:number}> = {};

    for (const p of range) {
      const d = parseDate(p.paymentDate as any);
      const key = keyFn(d);
      map[key] = map[key] || { in: 0, out: 0, net: 0, cumulative: 0 };
      const amt = Number(p.amount||0);
      if ((p.partyType||'customer')==='customer') map[key].in += amt; else if (p.partyType==='supplier') map[key].out += amt;
    }

    const entries = Object.entries(map).sort(([a],[b])=> a.localeCompare(b));
    let running = 0;
    const data = entries.map(([name, v])=>{ const net = (v.in||0)-(v.out||0); running += net; return { date: name, in: v.in, out: v.out, net, cumulative: running }; });
    return { granularity, data };
  }

  async getAlerts(companyId: string, criticalRunwayDays = 15, warningRunwayDays = 30) {
    if (!companyId) throw new BadRequestException('companyId requis');
    
    const now = new Date();
    const last30Start = new Date(now.getTime() - 30*24*3600*1000);
    const last90Start = new Date(now.getTime() - 90*24*3600*1000);

    const last30 = await this.paymentsRepo.find({
      where: { companyId, paymentDate: Between(last30Start, now) },
    });
    const last90 = await this.paymentsRepo.find({
      where: { companyId, paymentDate: Between(last90Start, now) },
    });
    const all = await this.paymentsRepo.find({ where: { companyId } });

    const last30In = last30.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + Number(p.amount||0), 0);
    const last30Out = last30.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + Number(p.amount||0), 0);
    const last90In = last90.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + Number(p.amount||0), 0);
    const last90Out = last90.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + Number(p.amount||0), 0);
    const totalIn = all.filter(p=> (p.partyType||'customer')==='customer').reduce((s,p)=> s + Number(p.amount||0), 0);
    const totalOut = all.filter(p=> p.partyType==='supplier').reduce((s,p)=> s + Number(p.amount||0), 0);
    const net = totalIn - totalOut;
    const last90Net = last90In - last90Out;

    const avgDailyOut = last30Out / 30;
    const runway = avgDailyOut > 0 ? Math.floor(net / avgDailyOut) : 999;

    const alerts: { level: 'critical'|'warning'|'info', message: string }[] = [];
    
    if (runway < criticalRunwayDays && runway >= 0) alerts.push({ level: 'critical', message: `Trésorerie critique: ${runway} jours de runway restants. Accélérer relances clients.` });
    else if (runway < warningRunwayDays && runway >= criticalRunwayDays) alerts.push({ level: 'warning', message: `Attention: ${runway} jours de runway. Surveiller encaissements à venir.` });
    
    if (last90Net < 0) alerts.push({ level: 'warning', message: `Tendance négative: flux net négatif sur 90 jours (${last90Net} XOF).` });
    if (last30In === 0) alerts.push({ level: 'warning', message: `Aucun encaissement sur les 30 derniers jours. Vérifier synchronisation.` });
    if (alerts.length === 0 && net > 0) alerts.push({ level: 'info', message: `Situation saine: solde positif (${net} XOF), runway > ${warningRunwayDays} jours.` });

    return { alerts, metrics: { runway, net, last90Net, last30In, last30Out } };
  }

  async checkAndNotifyAlerts(params: {
    companyId: string;
    userEmail: string;
    userPhone: string;
    companyName: string;
    criticalRunwayDays?: number;
    warningRunwayDays?: number;
  }) {
    const { companyId, userEmail, userPhone, companyName } = params;
    const criticalThreshold = params.criticalRunwayDays || 7; // Seuil pour notifications: 7 jours par défaut
    const warningThreshold = params.warningRunwayDays || 15;

    // Récupérer les alertes
    const result = await this.getAlerts(companyId, criticalThreshold, warningThreshold);
    
    // Filtrer seulement les alertes critical et warning
    const notifiableAlerts = result.alerts.filter(a => a.level === 'critical' || a.level === 'warning');
    
    if (notifiableAlerts.length === 0) {
      return { notificationsSent: 0, message: 'Aucune alerte à notifier' };
    }

    // Envoyer notifications pour chaque alerte critique ou warning
    for (const alert of notifiableAlerts) {
      await this.notificationsService.notifyTreasuryAlert({
        userEmail,
        userPhone,
        companyName,
        runway: result.metrics.runway,
        currentBalance: result.metrics.net,
        level: alert.level as 'critical' | 'warning',
      });
    }

    return {
      notificationsSent: notifiableAlerts.length,
      alerts: notifiableAlerts,
      metrics: result.metrics,
    };
  }

  async getForecast(companyId: string, horizonDays = 7) {
    if (!companyId) throw new BadRequestException('companyId requis');
    const now = new Date();
    const last30Start = new Date(now.getTime() - 30*24*3600*1000);

    const last30 = await this.paymentsRepo.find({
      where: { companyId, paymentDate: Between(last30Start, now) },
      order: { paymentDate: 'ASC' },
    });
    const all = await this.paymentsRepo.find({ where: { companyId } });

    const sum = (arr: number[]) => arr.reduce((s,v)=> s+v, 0);
    const isIn = (p: Payment)=> (p.partyType||'customer')==='customer';
    const isOut = (p: Payment)=> p.partyType==='supplier';

    const last30In = sum(last30.filter(isIn).map(p=> Number(p.amount||0)));
    const last30Out = sum(last30.filter(isOut).map(p=> Number(p.amount||0)));

    const avgDailyIn = last30In / 30;
    const avgDailyOut = last30Out / 30;

    const totalIn = sum(all.filter(isIn).map(p=> Number(p.amount||0)));
    const totalOut = sum(all.filter(isOut).map(p=> Number(p.amount||0)));
    let balance = totalIn - totalOut;

    const points: { date: string; in: number; out: number; net: number; projectedBalance: number }[] = [];
    for (let i=1; i<=Math.max(1, horizonDays); i++) {
      const d = new Date(now.getTime() + i*24*3600*1000);
      const inflow = Math.max(0, Math.round(avgDailyIn));
      const outflow = Math.max(0, Math.round(avgDailyOut));
      const net = inflow - outflow;
      balance += net;
      points.push({ date: ymd(d), in: inflow, out: outflow, net, projectedBalance: balance });
    }

    const dataDays = new Set(last30.map(p=> (p.paymentDate as any)?.toString()?.slice(0,10))).size;
    const confidence = Math.max(0.2, Math.min(0.95, dataDays/30));

    const recommendations: string[] = [];
    const runway = avgDailyOut>0 ? Math.floor((totalIn-totalOut)/avgDailyOut) : 999;
    if (runway < 7) recommendations.push('Runway < 7 jours: relancer fortement les encaissements et différer les décaissements non urgents.');
    if (points.slice(0,7).some(p=> p.net < 0)) recommendations.push('Flux net négatif attendu à court terme: surveiller la facturation et les relances.');

    return {
      horizon: horizonDays,
      startDate: ymd(now),
      confidence,
      points,
      recommendations,
    };
  }
}
