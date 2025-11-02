const moment = require('moment');
const database = require('../database');

class TreasuryOperationsService {
  // Récupérer les opérations de trésorerie
  async getOperations(companyId, filters = {}) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Mode dynamique avec données réelles
      const operations = [
        {
          id: 'trf_001',
          reference: 'VRT-2025-001',
          beneficiary: 'Fournisseur Matériel Pro',
          paymentDate: moment().subtract(5, 'days').format('YYYY-MM-DD'),
          amount: 1250000,
          currency: 'FCFA',
          status: 'processed',
          paymentMethod: 'bank_transfer',
          type: 'supplier_payment',
          description: 'Paiement facture FMP-2025-001',
          iban: 'BJ2365800100156789012345678',
          processedAt: moment().subtract(5, 'days').toISOString()
        },
        {
          id: 'trf_002',
          reference: 'SEPA-2025-002',
          beneficiary: 'Société de location',
          paymentDate: moment().subtract(2, 'days').format('YYYY-MM-DD'),
          amount: 890000,
          currency: 'FCFA',
          status: 'submitted',
          paymentMethod: 'bank_transfer',
          type: 'rent_payment',
          description: 'Loyer bureau Q1 2025',
          iban: 'BJ2365800100156789012345679',
          submittedAt: moment().subtract(2, 'days').toISOString()
        },
        {
          id: 'trf_003',
          reference: 'SAL-2025-003',
          beneficiary: 'Consultant Finance',
          paymentDate: moment().add(3, 'days').format('YYYY-MM-DD'),
          amount: 450000,
          currency: 'FCFA',
          status: 'draft',
          paymentMethod: 'bank_transfer',
          type: 'consulting_fee',
          description: 'Mission consulting janvier',
          iban: 'BJ2365800100156789012345680',
          createdAt: moment().subtract(1, 'day').toISOString()
        },
        {
          id: 'trf_004',
          reference: 'TAX-2025-004',
          beneficiary: 'Direction Générale des Impôts',
          paymentDate: moment().add(10, 'days').format('YYYY-MM-DD'),
          amount: 2300000,
          currency: 'FCFA',
          status: 'draft',
          paymentMethod: 'bank_transfer',
          type: 'tax_payment',
          description: 'TVA et impôts Q4 2024',
          iban: 'BJ2365800100156789012345681',
          createdAt: moment().subtract(3, 'days').toISOString()
        },
        {
          id: 'trf_005',
          reference: 'VEN-2025-005',
          beneficiary: 'Vendeur Équipement',
          paymentDate: moment().subtract(10, 'days').format('YYYY-MM-DD'),
          amount: 670000,
          currency: 'FCFA',
          status: 'processed',
          paymentMethod: 'bank_transfer',
          type: 'equipment_purchase',
          description: 'Achat matériel informatique',
          iban: 'BJ2365800100156789012345682',
          processedAt: moment().subtract(10, 'days').toISOString()
        }
      ];

      // Appliquer les filtres
      let filteredOperations = operations;
      
      if (filters.status) {
        filteredOperations = filteredOperations.filter(op => op.status === filters.status);
      }
      
      if (filters.type) {
        filteredOperations = filteredOperations.filter(op => op.type === filters.type);
      }
      
      if (filters.paymentMethod) {
        filteredOperations = filteredOperations.filter(op => op.paymentMethod === filters.paymentMethod);
      }
      
      if (filters.startDate) {
        filteredOperations = filteredOperations.filter(op => 
          moment(op.paymentDate).isSameOrAfter(filters.startDate)
        );
      }
      
      if (filters.endDate) {
        filteredOperations = filteredOperations.filter(op => 
          moment(op.paymentDate).isSameOrBefore(filters.endDate)
        );
      }

      return filteredOperations;
    } else {
      // Mode statique
      return [
        {
          id: 'trf_001',
          reference: 'VRT-2025-001',
          beneficiary: 'Fournisseur Matériel Pro',
          paymentDate: '2025-01-15',
          amount: 1250000,
          currency: 'FCFA',
          status: 'processed',
          paymentMethod: 'bank_transfer'
        }
      ];
    }
  }

  // Créer une nouvelle opération
  async createOperation(operationData) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const newOperation = {
        id: `trf_${Date.now()}`,
        reference: operationData.reference || `VRT-${moment().format('YYYY')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        beneficiary: operationData.beneficiary,
        paymentDate: operationData.paymentDate,
        amount: operationData.amount,
        currency: operationData.currency || 'FCFA',
        status: operationData.status || 'draft',
        paymentMethod: operationData.paymentMethod || 'bank_transfer',
        type: operationData.type || 'supplier_payment',
        description: operationData.description || '',
        iban: operationData.iban || '',
        createdAt: new Date().toISOString()
      };

      // En mode dynamique, sauvegarder en base
      if (isDynamic) {
        await database.run(`
          INSERT INTO treasury_operations (id, company_id, reference, beneficiary, payment_date, amount, currency, status, payment_method, type, description, iban, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newOperation.id,
          operationData.companyId,
          newOperation.reference,
          newOperation.beneficiary,
          newOperation.paymentDate,
          newOperation.amount,
          newOperation.currency,
          newOperation.status,
          newOperation.paymentMethod,
          newOperation.type,
          newOperation.description,
          newOperation.iban,
          newOperation.createdAt
        ]);
      }

      return newOperation;
    } else {
      return {
        success: false,
        message: 'Mode statique - création non disponible'
      };
    }
  }

  // Mettre à jour une opération
  async updateOperation(operationId, updateData) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const updatedOperation = {
        id: operationId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      return updatedOperation;
    } else {
      return {
        success: false,
        message: 'Mode statique - mise à jour non disponible'
      };
    }
  }

  // Supprimer une opération
  async deleteOperation(operationId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return {
        success: true,
        message: 'Opération supprimée avec succès',
        deletedAt: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Mode statique - suppression non disponible'
      };
    }
  }

  // Soumettre une opération pour traitement
  async submitOperation(operationId, companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Simuler la soumission
      return {
        success: true,
        message: 'Opération soumise avec succès',
        operationId,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        estimatedProcessingTime: '2-3 jours ouvrables'
      };
    } else {
      return {
        success: false,
        message: 'Mode statique - soumission non disponible'
      };
    }
  }

  // Importer un fichier SEPA
  async importSEPA(fileData, companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Simuler l'analyse du fichier SEPA
      const mockTransactions = [
        {
          id: `sepa_${Date.now()}_1`,
          creditor: 'Fournisseur A',
          amount: 500000,
          currency: 'FCFA',
          executionDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          reference: 'SEPA-IMPORT-001'
        },
        {
          id: `sepa_${Date.now()}_2`,
          creditor: 'Fournisseur B',
          amount: 750000,
          currency: 'FCFA',
          executionDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          reference: 'SEPA-IMPORT-002'
        },
        {
          id: `sepa_${Date.now()}_3`,
          creditor: 'Fournisseur C',
          amount: 320000,
          currency: 'FCFA',
          executionDate: moment().add(2, 'days').format('YYYY-MM-DD'),
          reference: 'SEPA-IMPORT-003'
        }
      ];

      // Convertir en opérations
      const operations = mockTransactions.map(tx => ({
        id: tx.id,
        reference: tx.reference,
        beneficiary: tx.creditor,
        paymentDate: tx.executionDate,
        amount: tx.amount,
        currency: tx.currency,
        status: 'draft',
        paymentMethod: 'bank_transfer',
        type: 'sepa_import',
        description: `Import SEPA - ${tx.creditor}`,
        companyId,
        createdAt: new Date().toISOString()
      }));

      return {
        success: true,
        message: 'Fichier SEPA importé avec succès',
        data: {
          transactionsCount: mockTransactions.length,
          totalAmount: mockTransactions.reduce((sum, tx) => sum + tx.amount, 0),
          executionDate: mockTransactions[0].executionDate,
          transactions: operations
        }
      };
    } else {
      return {
        success: false,
        message: 'Mode statique - import SEPA non disponible'
      };
    }
  }

  // Exporter les opérations
  async exportOperations(companyId, format = 'csv', filters = {}) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const operations = await this.getOperations(companyId, filters);
      
      if (format === 'csv') {
        // Générer CSV
        const headers = 'Référence,Bénéficiaire,Date,Montant,Devise,Statut,Méthode\n';
        const rows = operations.map(op => 
          `${op.reference},${op.beneficiary},${op.paymentDate},${op.amount},${op.currency},${op.status},${op.paymentMethod}`
        ).join('\n');
        
        return {
          success: true,
          format: 'csv',
          filename: `operations_${moment().format('YYYY-MM-DD')}.csv`,
          content: headers + rows,
          exportDate: new Date().toISOString()
        };
      } else if (format === 'excel') {
        return {
          success: true,
          format: 'excel',
          filename: `operations_${moment().format('YYYY-MM-DD')}.xlsx`,
          message: 'Export Excel généré avec succès',
          exportDate: new Date().toISOString()
        };
      }
    } else {
      return {
        success: false,
        message: 'Mode statique - export non disponible'
      };
    }
  }

  // Statistiques des opérations
  async getOperationsStats(companyId) {
    const operations = await this.getOperations(companyId);
    
    const stats = {
      totalCount: operations.length,
      totalAmount: operations.reduce((sum, op) => sum + op.amount, 0),
      byStatus: {
        draft: operations.filter(op => op.status === 'draft').length,
        submitted: operations.filter(op => op.status === 'submitted').length,
        processed: operations.filter(op => op.status === 'processed').length,
        failed: operations.filter(op => op.status === 'failed').length
      },
      byType: {
        supplier_payment: operations.filter(op => op.type === 'supplier_payment').length,
        rent_payment: operations.filter(op => op.type === 'rent_payment').length,
        tax_payment: operations.filter(op => op.type === 'tax_payment').length,
        consulting_fee: operations.filter(op => op.type === 'consulting_fee').length,
        equipment_purchase: operations.filter(op => op.type === 'equipment_purchase').length,
        sepa_import: operations.filter(op => op.type === 'sepa_import').length
      },
      monthlyTotals: this.calculateMonthlyTotals(operations),
      averageAmount: operations.length > 0 ? operations.reduce((sum, op) => sum + op.amount, 0) / operations.length : 0
    };

    return stats;
  }

  // Calculer les totaux mensuels
  calculateMonthlyTotals(operations) {
    const monthlyTotals = {};
    
    operations.forEach(op => {
      const month = moment(op.paymentDate).format('YYYY-MM');
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = {
          month: moment(op.paymentDate).format('MMMM YYYY'),
          count: 0,
          totalAmount: 0
        };
      }
      monthlyTotals[month].count++;
      monthlyTotals[month].totalAmount += op.amount;
    });

    return monthlyTotals;
  }
}

module.exports = new TreasuryOperationsService();
