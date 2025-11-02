import { Injectable } from '@nestjs/common';
import { SigService } from './sig.service';

@Injectable()
export class CafService {
  constructor(private sigService: SigService) {}

  async calculateCAF(companyId: string, startDate: string, endDate: string) {
    const sig = await this.sigService.calculateSIG(companyId, startDate, endDate);
    
    const cafSoustractive = sig.ebe - sig.resultatExploitation;
    const cafAdditive = sig.resultatNet + cafSoustractive;

    return {
      cafSoustractive,
      cafAdditive,
      resultatNet: sig.resultatNet,
      ebe: sig.ebe,
      period: { startDate, endDate },
    };
  }
}
