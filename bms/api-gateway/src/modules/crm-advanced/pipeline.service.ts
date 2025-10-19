import { Injectable } from '@nestjs/common';

@Injectable()
export class PipelineService {
  async createOpportunity(data: any): Promise<any> {
    return { id: `OPP-${Date.now()}`, ...data, stage: 'qualification', score: 50, probability: 10 };
  }

  async moveStage(opportunityId: string, newStage: string): Promise<any> {
    const stages = { qualification: 10, proposal: 25, negotiation: 50, closing: 75, won: 100, lost: 0 };
    return { opportunityId, stage: newStage, probability: stages[newStage] };
  }

  async forecast(period: any): Promise<any> {
    return { weighted: 0, bestCase: 0, worstCase: 0, count: 0 };
  }

  async calculateScore(data: any): Promise<number> {
    return 50;
  }
}
