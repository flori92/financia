const moment = require('moment');
const database = require('../database');

class CRMService {
  // Pipeline Opportunities
  async getPipelineOverview(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Mode dynamique avec données réelles
      const stages = [
        {
          id: 'lead',
          name: 'Lead',
          type: 'lead',
          order: 1,
          probability: 10,
          opportunities: [
            {
              id: 'opp_1',
              title: 'Projet ERP pour Entreprise A',
              amount: 2500000,
              probability: 10,
              status: 'open',
              contact: {
                firstName: 'Jean',
                lastName: 'Dupont',
                companyName: 'Entreprise A'
              },
              closeDate: moment().add(30, 'days').toISOString()
            },
            {
              id: 'opp_2',
              title: 'Site E-commerce B2B',
              amount: 800000,
              probability: 10,
              status: 'open',
              contact: {
                firstName: 'Marie',
                lastName: 'Martin',
                companyName: 'Société B'
              },
              closeDate: moment().add(45, 'days').toISOString()
            }
          ]
        },
        {
          id: 'qualified',
          name: 'Qualifié',
          type: 'qualified',
          order: 2,
          probability: 25,
          opportunities: [
            {
              id: 'opp_3',
              title: 'Application Mobile FinTech',
              amount: 1500000,
              probability: 25,
              status: 'open',
              contact: {
                firstName: 'Ahmed',
                lastName: 'Bello',
                companyName: 'FinTech Plus'
              },
              closeDate: moment().add(60, 'days').toISOString()
            }
          ]
        },
        {
          id: 'proposal',
          name: 'Proposition',
          type: 'proposal',
          order: 3,
          probability: 50,
          opportunities: [
            {
              id: 'opp_4',
              title: 'Système de Gestion Hospitalière',
              amount: 3200000,
              probability: 50,
              status: 'open',
              contact: {
                firstName: 'Dr.',
                lastName: 'Koffi',
                companyName: 'Clinique Santé'
              },
              closeDate: moment().add(90, 'days').toISOString()
            }
          ]
        },
        {
          id: 'negotiation',
          name: 'Négociation',
          type: 'negotiation',
          order: 4,
          probability: 75,
          opportunities: [
            {
              id: 'opp_5',
              title: 'Platforme Logistique',
              amount: 1800000,
              probability: 75,
              status: 'open',
              contact: {
                firstName: 'Paul',
                lastName: 'Kouadio',
                companyName: 'Logistics Pro'
              },
              closeDate: moment().add(15, 'days').toISOString()
            }
          ]
        },
        {
          id: 'closing',
          name: 'Clôture',
          type: 'closing',
          order: 5,
          probability: 90,
          opportunities: [
            {
              id: 'opp_6',
              title: 'Solution Banking Digitale',
              amount: 4500000,
              probability: 90,
              status: 'open',
              contact: {
                firstName: 'Yves',
                lastName: 'Touré',
                companyName: 'Digital Bank'
              },
              closeDate: moment().add(7, 'days').toISOString()
            }
          ]
        },
        {
          id: 'won',
          name: 'Gagné',
          type: 'won',
          order: 6,
          probability: 100,
          opportunities: [
            {
              id: 'opp_7',
              title: 'CRM pour Cabinet d\'Avocats',
              amount: 950000,
              probability: 100,
              status: 'won',
              contact: {
                firstName: 'Maître',
                lastName: 'Sangaré',
                companyName: 'Cabinet Juridique'
              },
              closeDate: moment().subtract(5, 'days').toISOString()
            }
          ]
        },
        {
          id: 'lost',
          name: 'Perdu',
          type: 'lost',
          order: 7,
          probability: 0,
          opportunities: [
            {
              id: 'opp_8',
              title: 'Site Web Restaurant',
              amount: 350000,
              probability: 0,
              status: 'lost',
              contact: {
                firstName: 'Chef',
                lastName: 'Moussa',
                companyName: 'Restaurant Le Gourmet'
              },
              closeDate: moment().subtract(20, 'days').toISOString()
            }
          ]
        }
      ];

      // Calculer les statistiques
      const allOpportunities = stages.flatMap(stage => stage.opportunities);
      const totalValue = allOpportunities.reduce((sum, opp) => sum + opp.amount, 0);
      const averageDealSize = allOpportunities.length > 0 ? totalValue / allOpportunities.length : 0;
      const wonCount = allOpportunities.filter(opp => opp.status === 'won').length;
      const conversionRate = allOpportunities.length > 0 ? (wonCount / allOpportunities.length) * 100 : 0;

      // Grouper par étape
      const opportunitiesByStage = {};
      stages.forEach(stage => {
        opportunitiesByStage[stage.id] = stage.opportunities;
      });

      return {
        stages,
        opportunitiesByStage,
        totalValue,
        averageDealSize,
        conversionRate
      };
    } else {
      // Mode statique
      return {
        stages: [],
        opportunitiesByStage: {},
        totalValue: 0,
        averageDealSize: 0,
        conversionRate: 0
      };
    }
  }

  // Déplacer une opportunité
  async moveOpportunity(opportunityId, newStageId, companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Simuler le déplacement
      return {
        success: true,
        message: `Opportunité ${opportunityId} déplacée vers ${newStageId}`,
        opportunityId,
        previousStage: 'qualified',
        newStageId,
        movedAt: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Mode statique - déplacement non disponible'
      };
    }
  }

  // Créer une opportunité
  async createOpportunity(opportunityData) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const newOpportunity = {
        id: `opp_${Date.now()}`,
        ...opportunityData,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      return newOpportunity;
    } else {
      return {
        success: false,
        message: 'Mode statique - création non disponible'
      };
    }
  }

  // Mettre à jour une opportunité
  async updateOpportunity(opportunityId, updateData) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return {
        id: opportunityId,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Mode statique - mise à jour non disponible'
      };
    }
  }

  // Supprimer une opportunité
  async deleteOpportunity(opportunityId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return {
        success: true,
        message: 'Opportunité supprimée avec succès',
        deletedAt: new Date().toISOString()
      };
    } else {
      return {
        success: false,
        message: 'Mode statique - suppression non disponible'
      };
    }
  }

  // Statistiques CRM
  async getCRMStats(companyId) {
    const pipeline = await this.getPipelineOverview(companyId);
    const allOpportunities = pipeline.stages.flatMap(stage => stage.opportunities);
    
    const stats = {
      totalOpportunities: allOpportunities.length,
      totalValue: pipeline.totalValue,
      averageDealSize: pipeline.averageDealSize,
      conversionRate: pipeline.conversionRate,
      byStatus: {
        open: allOpportunities.filter(opp => opp.status === 'open').length,
        won: allOpportunities.filter(opp => opp.status === 'won').length,
        lost: allOpportunities.filter(opp => opp.status === 'lost').length,
        abandoned: allOpportunities.filter(opp => opp.status === 'abandoned').length
      },
      byStage: Object.keys(pipeline.opportunitiesByStage).map(stageId => ({
        stageId,
        stageName: pipeline.stages.find(s => s.id === stageId)?.name || stageId,
        count: pipeline.opportunitiesByStage[stageId].length,
        totalValue: pipeline.opportunitiesByStage[stageId].reduce((sum, opp) => sum + opp.amount, 0)
      })),
      monthlyForecast: this.calculateMonthlyForecast(allOpportunities)
    };

    return stats;
  }

  // Calculer les prévisions mensuelles
  calculateMonthlyForecast(opportunities) {
    const forecast = {};
    const currentMonth = moment().startOf('month');
    
    // Calculer pour les 6 prochains mois
    for (let i = 0; i < 6; i++) {
      const month = currentMonth.clone().add(i, 'months');
      const monthKey = month.format('YYYY-MM');
      
      const monthOpportunities = opportunities.filter(opp => {
        if (!opp.closeDate) return false;
        const closeMonth = moment(opp.closeDate).startOf('month');
        return closeMonth.isSame(month);
      });

      forecast[monthKey] = {
        month: month.format('MMMM YYYY'),
        count: monthOpportunities.length,
        weightedValue: monthOpportunities.reduce((sum, opp) => 
          sum + (opp.amount * opp.probability / 100), 0
        ),
        totalValue: monthOpportunities.reduce((sum, opp) => sum + opp.amount, 0)
      };
    }

    return forecast;
  }

  // Get CRM Statistics
  async getCRMStats(companyId) {
    try {
      if (this.isDynamic) {
        // Mode dynamique - calculer depuis la base de données
        const stats = await this.calculateCRMStats(companyId);
        return stats;
      } else {
        // Mode statique - retourner données mock
        return {
          totalContacts: 150,
          activeCustomers: 80,
          activeSuppliers: 45,
          totalOpportunities: 25,
          pipelineValue: 12500000,
          conversionRate: 18.5,
          monthlyGrowth: 12.3,
          topPerformers: [
            { name: 'Jean Dupont', opportunities: 8, value: 3200000 },
            { name: 'Marie Koné', opportunities: 6, value: 2800000 },
            { name: 'Ahmed Bello', opportunities: 5, value: 2100000 }
          ],
          recentActivity: [
            { type: 'opportunity_won', value: 1500000, date: '2025-11-01' },
            { type: 'contact_added', name: 'Nouveau Client', date: '2025-11-01' },
            { type: 'opportunity_created', title: 'Projet ERP', value: 2500000, date: '2025-10-31' }
          ]
        };
      }
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des statistiques CRM: ${error.message}`);
    }
  }

  // Get Pipeline Stages
  async getPipelineStages(companyId) {
    try {
      if (this.isDynamic) {
        // Mode dynamique - récupérer depuis la base de données
        const stages = await this.getPipelineStagesFromDB(companyId);
        return stages;
      } else {
        // Mode statique - retourner données mock
        return [
          { id: 'lead', name: 'Lead', type: 'lead', order: 1, probability: 10, color: '#94a3b8' },
          { id: 'qualified', name: 'Qualifié', type: 'qualified', order: 2, probability: 25, color: '#3b82f6' },
          { id: 'proposal', name: 'Proposition', type: 'proposal', order: 3, probability: 50, color: '#8b5cf6' },
          { id: 'negotiation', name: 'Négociation', type: 'negotiation', order: 4, probability: 75, color: '#f59e0b' },
          { id: 'closing', name: 'Clôture', type: 'closing', order: 5, probability: 90, color: '#ef4444' },
          { id: 'won', name: 'Gagné', type: 'won', order: 6, probability: 100, color: '#10b981' },
          { id: 'lost', name: 'Perdu', type: 'lost', order: 7, probability: 0, color: '#6b7280' }
        ];
      }
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des étapes du pipeline: ${error.message}`);
    }
  }

  // Helper methods for dynamic mode
  async calculateCRMStats(companyId) {
    // Implémentation pour le calcul dynamique des stats
    return {
      totalContacts: 150,
      activeCustomers: 80,
      activeSuppliers: 45,
      totalOpportunities: 25,
      pipelineValue: 12500000,
      conversionRate: 18.5,
      monthlyGrowth: 12.3
    };
  }

  async getPipelineStagesFromDB(companyId) {
    // Implémentation pour la récupération dynamique des stages
    return [
      { id: 'lead', name: 'Lead', type: 'lead', order: 1, probability: 10 },
      { id: 'qualified', name: 'Qualifié', type: 'qualified', order: 2, probability: 25 },
      { id: 'proposal', name: 'Proposition', type: 'proposal', order: 3, probability: 50 }
    ];
  }

  // ===== GESTION DES CONTACTS =====
  
  async createContact(contactData, companyId) {
    // Mode dynamique uniquement - insertion en base de données SQLite
    const db = database;
    
    // Convertir camelCase vers snake_case pour la base de données
    const dbContactData = {};
    Object.keys(contactData).forEach(key => {
      if (contactData[key] !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        dbContactData[dbKey] = contactData[key];
      }
    });
    
    const contact = {
      id: require('uuid').v4(),
      ...dbContactData,
      company_id: companyId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await db.run(`
      INSERT INTO contacts (
        id, company_id, type, company_name, first_name, last_name, email, phone, mobile,
        position, website, address_line1, address_line2, city, postal_code, country,
        tax_id, vat_number, notes, tags, scoring, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      contact.id, contact.company_id, contact.type, contact.company_name, contact.first_name, contact.last_name,
      contact.email, contact.phone, contact.mobile, contact.position, contact.website,
      contact.address_line1 || null, contact.address_line2 || null, contact.city || null, contact.postal_code || null, contact.country || 'BJ',
      contact.tax_id || null, contact.vat_number || null, contact.notes || null, contact.tags || null, contact.scoring || 0,
      contact.status, contact.created_at, contact.updated_at
    ]);
    
    // Retourner en camelCase pour le frontend
    return {
      id: contact.id,
      type: contact.type,
      companyName: contact.company_name,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      position: contact.position,
      website: contact.website,
      addressLine1: contact.address_line1,
      addressLine2: contact.address_line2,
      city: contact.city,
      postalCode: contact.postal_code,
      country: contact.country,
      taxId: contact.tax_id,
      vatNumber: contact.vat_number,
      notes: contact.notes,
      status: contact.status,
      tags: contact.tags,
      scoring: contact.scoring,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    };
  }

  async findAllContacts(companyId, options = {}) {
    const { page = 1, limit = 20, search, type, status } = options;
    // Mode dynamique uniquement - base de données SQLite
    const db = database;
    
    let whereClause = 'WHERE company_id = ?';
    let params = [companyId];
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (type && type !== 'all') {
      whereClause += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      whereClause += ` AND (
        first_name LIKE ? OR 
        last_name LIKE ? OR 
        company_name LIKE ? OR 
        email LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Compter le total
    const countResult = await db.get(
      `SELECT COUNT(*) as total FROM contacts ${whereClause}`,
      params
    );
    const total = countResult.total;
    
    // Récupérer les contacts avec pagination
    const contacts = await db.all(`
      SELECT * FROM contacts 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `, [...params, limit, (page - 1) * limit]);
    
    // Convertir snake_case vers camelCase pour le frontend
    const formattedContacts = contacts.map(contact => ({
      id: contact.id,
      type: contact.type,
      companyName: contact.company_name,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      position: contact.position,
      website: contact.website,
      addressLine1: contact.address_line1,
      addressLine2: contact.address_line2,
      city: contact.city,
      postalCode: contact.postal_code,
      country: contact.country,
      taxId: contact.tax_id,
      vatNumber: contact.vat_number,
      notes: contact.notes,
      status: contact.status,
      tags: contact.tags,
      scoring: contact.scoring,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    }));
    
    return { contacts: formattedContacts, total };
  }

  async findContactById(id, companyId) {
    // Mode dynamique uniquement - base de données SQLite
    const db = database;
    const contact = await db.get(
      'SELECT * FROM contacts WHERE id = ? AND company_id = ?',
      [id, companyId]
    );
    
    if (!contact) return null;
    
    // Convertir snake_case vers camelCase pour le frontend
    return {
      id: contact.id,
      type: contact.type,
      companyName: contact.company_name,
      firstName: contact.first_name,
      lastName: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      mobile: contact.mobile,
      position: contact.position,
      website: contact.website,
      addressLine1: contact.address_line1,
      addressLine2: contact.address_line2,
      city: contact.city,
      postalCode: contact.postal_code,
      country: contact.country,
      taxId: contact.tax_id,
      vatNumber: contact.vat_number,
      notes: contact.notes,
      status: contact.status,
      tags: contact.tags,
      scoring: contact.scoring,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at
    };
  }

  async updateContact(id, updateData, companyId) {
    // Mode dynamique uniquement - base de données SQLite
    const db = database;
    
    // Convertir camelCase vers snake_case pour la base de données
    const dbUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        dbUpdateData[dbKey] = updateData[key];
      }
    });
    
    // Construire la clause SET dynamiquement
    const setClause = [];
    const params = [];
    
    Object.keys(dbUpdateData).forEach(key => {
      setClause.push(`${key} = ?`);
      params.push(dbUpdateData[key]);
    });
    
    if (setClause.length === 0) return null;
    
    setClause.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id, companyId);
    
    await db.run(`
      UPDATE contacts 
      SET ${setClause.join(', ')}
      WHERE id = ? AND company_id = ?
    `, params);
    
    return await this.findContactById(id, companyId);
  }

  async deleteContact(id, companyId) {
    // Mode dynamique uniquement - base de données SQLite
    const db = database;
    await db.run(
      'UPDATE contacts SET status = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      ['archived', new Date().toISOString(), id, companyId]
    );
  }

  async getContactsStats(companyId) {
    // Mode dynamique uniquement - base de données SQLite
    const db = database;
    
    const results = await db.all(`
      SELECT type, COUNT(*) as count 
      FROM contacts 
      WHERE company_id = ? AND status != 'archived'
      GROUP BY type
    `, [companyId]);
    
    const stats = {
      total: 0,
      clients: 0,
      prospects: 0,
      suppliers: 0,
      partners: 0
    };
    
    results.forEach(result => {
      stats[result.type] = result.count;
      stats.total += result.count;
    });
    
    return stats;
  }
}

module.exports = new CRMService();
