import { Injectable } from '@nestjs/common';

/**
 * Service de gestion des immobilisations
 */
@Injectable()
export class ImmobilisationsService {
  
  /**
   * Créer une immobilisation
   */
  async createAsset(data: any): Promise<any> {
    const asset = {
      id: this.generateId(),
      ...data,
      acquisitionDate: new Date(data.acquisitionDate),
      depreciationPlan: this.calculateDepreciationPlan(data),
      createdAt: new Date()
    };
    
    // Écriture d'acquisition
    await this.generateAcquisitionEntry(asset);
    
    return asset;
  }

  /**
   * Calcul plan d'amortissement
   */
  calculateDepreciationPlan(asset: any): any[] {
    const plan = [];
    const { acquisitionValue, residualValue, usefulLife, method, acquisitionDate } = asset;
    
    const depreciableAmount = acquisitionValue - (residualValue || 0);
    let remainingValue = acquisitionValue;
    
    switch (method) {
      case 'linear': // Linéaire
        const annualDepreciation = depreciableAmount / usefulLife;
        for (let year = 0; year < usefulLife; year++) {
          const depreciation = year === usefulLife - 1 
            ? remainingValue - (residualValue || 0)
            : annualDepreciation;
          
          plan.push({
            year: new Date(acquisitionDate).getFullYear() + year,
            depreciation,
            cumulativeDepreciation: plan.reduce((sum, p) => sum + p.depreciation, 0) + depreciation,
            netBookValue: remainingValue - depreciation
          });
          
          remainingValue -= depreciation;
        }
        break;
        
      case 'declining': // Dégressif
        const rate = this.getDecliningRate(usefulLife);
        for (let year = 0; year < usefulLife; year++) {
          const depreciation = Math.max(
            remainingValue * rate,
            depreciableAmount / usefulLife
          );
          
          plan.push({
            year: new Date(acquisitionDate).getFullYear() + year,
            depreciation,
            cumulativeDepreciation: plan.reduce((sum, p) => sum + p.depreciation, 0) + depreciation,
            netBookValue: remainingValue - depreciation
          });
          
          remainingValue -= depreciation;
          if (remainingValue <= (residualValue || 0)) break;
        }
        break;
        
      case 'units': // Unités d'œuvre
        // À implémenter selon usage réel
        break;
    }
    
    return plan;
  }

  /**
   * Calcul dotation mensuelle
   */
  async calculateMonthlyDepreciation(companyId: string, year: number, month: number): Promise<any[]> {
    const assets = await this.getActiveAssets(companyId);
    const entries = [];
    
    for (const asset of assets) {
      const plan = asset.depreciationPlan.find(p => p.year === year);
      if (!plan) continue;
      
      const monthlyAmount = plan.depreciation / 12;
      
      entries.push({
        assetId: asset.id,
        assetName: asset.name,
        amount: monthlyAmount,
        entry: {
          entryDate: new Date(year, month - 1, 1),
          description: `Dotation amortissement ${asset.name}`,
          journalCode: 'OD',
          lines: [
            {
              accountNumber: this.getDepreciationExpenseAccount(asset.category),
              debit: monthlyAmount,
              credit: 0,
              label: asset.name
            },
            {
              accountNumber: this.getAccumulatedDepreciationAccount(asset.category),
              debit: 0,
              credit: monthlyAmount,
              label: asset.name
            }
          ]
        }
      });
    }
    
    return entries;
  }

  /**
   * Cession d'immobilisation
   */
  async disposeAsset(assetId: string, disposalData: any): Promise<any> {
    const asset = await this.getAsset(assetId);
    const disposalDate = new Date(disposalData.disposalDate);
    
    // Calcul valeur nette comptable
    const netBookValue = this.calculateNetBookValue(asset, disposalDate);
    
    // Calcul plus/moins-value
    const capitalGain = disposalData.salePrice - netBookValue;
    
    // Écritures de cession
    const entries = [];
    
    // 1. Sortie de l'actif
    entries.push({
      description: `Cession ${asset.name}`,
      journalCode: 'OD',
      lines: [
        {
          accountNumber: this.getAccumulatedDepreciationAccount(asset.category),
          debit: asset.cumulativeDepreciation,
          credit: 0
        },
        {
          accountNumber: asset.assetAccount,
          debit: 0,
          credit: asset.acquisitionValue
        },
        {
          accountNumber: capitalGain >= 0 ? '775000' : '675000', // Plus/moins-value
          debit: capitalGain < 0 ? Math.abs(capitalGain) : 0,
          credit: capitalGain > 0 ? capitalGain : 0
        }
      ]
    });
    
    // 2. Encaissement
    if (disposalData.salePrice > 0) {
      entries.push({
        description: `Encaissement cession ${asset.name}`,
        journalCode: 'BQ',
        lines: [
          {
            accountNumber: '512000', // Banque
            debit: disposalData.salePrice,
            credit: 0
          },
          {
            accountNumber: '775000', // Produit de cession
            debit: 0,
            credit: disposalData.salePrice
          }
        ]
      });
    }
    
    return {
      asset,
      netBookValue,
      salePrice: disposalData.salePrice,
      capitalGain,
      entries
    };
  }

  /**
   * Réévaluation
   */
  async revaluateAsset(assetId: string, newValue: number, date: Date): Promise<any> {
    const asset = await this.getAsset(assetId);
    const netBookValue = this.calculateNetBookValue(asset, date);
    const revaluationAmount = newValue - netBookValue;
    
    // Écriture de réévaluation
    const entry = {
      entryDate: date,
      description: `Réévaluation ${asset.name}`,
      journalCode: 'OD',
      lines: [
        {
          accountNumber: asset.assetAccount,
          debit: revaluationAmount > 0 ? revaluationAmount : 0,
          credit: revaluationAmount < 0 ? Math.abs(revaluationAmount) : 0
        },
        {
          accountNumber: '105000', // Écart de réévaluation
          debit: revaluationAmount < 0 ? Math.abs(revaluationAmount) : 0,
          credit: revaluationAmount > 0 ? revaluationAmount : 0
        }
      ]
    };
    
    return { asset, revaluationAmount, entry };
  }

  /**
   * Inventaire physique
   */
  async physicalInventory(companyId: string): Promise<any> {
    const assets = await this.getActiveAssets(companyId);
    
    return {
      totalAssets: assets.length,
      totalValue: assets.reduce((sum, a) => sum + a.acquisitionValue, 0),
      totalDepreciation: assets.reduce((sum, a) => sum + a.cumulativeDepreciation, 0),
      netValue: assets.reduce((sum, a) => sum + this.calculateNetBookValue(a, new Date()), 0),
      byCategory: this.groupByCategory(assets)
    };
  }

  // Helpers
  private getDecliningRate(usefulLife: number): number {
    if (usefulLife <= 3) return 1.25;
    if (usefulLife <= 5) return 1.75;
    return 2.25;
  }

  private getDepreciationExpenseAccount(category: string): string {
    const mapping = {
      'building': '681100',
      'equipment': '681200',
      'vehicle': '681300',
      'furniture': '681400',
      'software': '681500'
    };
    return mapping[category] || '681000';
  }

  private getAccumulatedDepreciationAccount(category: string): string {
    const mapping = {
      'building': '281000',
      'equipment': '282000',
      'vehicle': '283000',
      'furniture': '284000',
      'software': '285000'
    };
    return mapping[category] || '280000';
  }

  private calculateNetBookValue(asset: any, date: Date): number {
    const years = (date.getTime() - new Date(asset.acquisitionDate).getTime()) / (365 * 24 * 60 * 60 * 1000);
    const plan = asset.depreciationPlan.filter(p => p.year <= date.getFullYear());
    const totalDepreciation = plan.reduce((sum, p) => sum + p.depreciation, 0);
    return asset.acquisitionValue - totalDepreciation;
  }

  private groupByCategory(assets: any[]): any {
    const groups = {};
    assets.forEach(asset => {
      if (!groups[asset.category]) {
        groups[asset.category] = { count: 0, value: 0, depreciation: 0 };
      }
      groups[asset.category].count++;
      groups[asset.category].value += asset.acquisitionValue;
      groups[asset.category].depreciation += asset.cumulativeDepreciation;
    });
    return groups;
  }

  private generateId(): string {
    return `ASSET-${Date.now()}`;
  }

  private async generateAcquisitionEntry(asset: any): Promise<void> {}
  private async getAsset(id: string): Promise<any> { return {}; }
  private async getActiveAssets(companyId: string): Promise<any[]> { return []; }
}
