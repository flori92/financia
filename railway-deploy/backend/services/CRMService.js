const moment = require('moment');
const database = require('../database');

class CRMService {
  // Pipeline Opportunities - MODE 100% DYNAMIQUE SQLITE
  async getPipelineOverview(companyId) {
    const db = database;
    
    // Récupérer tous les stages du pipeline
    const stages = await db.all(`
      SELECT * FROM pipeline_stages 
      WHERE company_id = ? 
      ORDER BY order_number ASC
    `, [companyId]);
    
    // Récupérer toutes les opportunités avec leurs contacts
    const opportunities = await db.all(`
      SELECT 
        o.*,
        c.first_name,
        c.last_name,
        c.company_name,
        c.email,
        c.phone
      FROM opportunities o
      LEFT JOIN contacts c ON o.contact_id = c.id
      WHERE o.company_id = ?
      ORDER BY o.created_at DESC
    `, [companyId]);
    
    // Grouper les opportunités par stage
    const opportunitiesByStage = {};
    stages.forEach(stage => {
      opportunitiesByStage[stage.id] = [];
    });
    
    opportunities.forEach(opp => {
      if (opportunitiesByStage[opp.stage_id]) {
        opportunitiesByStage[opp.stage_id].push({
          id: opp.id,
          title: opp.title,
          amount: opp.amount,
          probability: opp.probability,
          status: opp.status,
          contact: opp.contact_id ? {
            firstName: opp.first_name,
            lastName: opp.last_name,
            companyName: opp.company_name,
            email: opp.email,
            phone: opp.phone
          } : undefined,
          closeDate: opp.close_date,
          description: opp.description,
          assignedTo: opp.assigned_to,
          createdAt: opp.created_at,
          updatedAt: opp.updated_at
        });
      }
    });
    
    // Ajouter les opportunités aux stages
    const stagesWithOpportunities = stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      type: stage.type,
      order: stage.order_number,
      probability: stage.probability,
      color: stage.color,
      opportunities: opportunitiesByStage[stage.id] || []
    }));
    
    // Calculer les statistiques
    const allOpportunities = opportunities.filter(opp => opp.status === 'open');
    const totalValue = allOpportunities.reduce((sum, opp) => sum + (opp.amount || 0), 0);
    const averageDealSize = allOpportunities.length > 0 ? totalValue / allOpportunities.length : 0;
    
    // Taux de conversion (opportunités gagnées / total)
    const wonOpportunities = opportunities.filter(opp => opp.status === 'won');
    const conversionRate = opportunities.length > 0 ? (wonOpportunities.length / opportunities.length) * 100 : 0;
    
    return {
      stages: stagesWithOpportunities,
      opportunitiesByStage,
      totalValue,
      averageDealSize,
      conversionRate
    };
  }

  // Déplacer une opportunité vers un autre stage
  async moveOpportunity(opportunityId, newStageId, companyId) {
    const db = database;
    
    // Vérifier que l'opportunité appartient à la compagnie
    const opportunity = await db.get(
      'SELECT id FROM opportunities WHERE id = ? AND company_id = ?',
      [opportunityId, companyId]
    );
    
    if (!opportunity) {
      throw new Error('Opportunité non trouvée');
    }
    
    // Vérifier que le stage appartient à la compagnie
    const stage = await db.get(
      'SELECT id, probability FROM pipeline_stages WHERE id = ? AND company_id = ?',
      [newStageId, companyId]
    );
    
    if (!stage) {
      throw new Error('Stage de pipeline non trouvé');
    }
    
    // Mettre à jour l'opportunité
    await db.run(`
      UPDATE opportunities 
      SET stage_id = ?, probability = ?, updated_at = ?
      WHERE id = ? AND company_id = ?
    `, [newStageId, stage.probability, new Date().toISOString(), opportunityId, companyId]);
    
    return { success: true, message: 'Opportunité déplacée avec succès' };
  }

  // Créer une nouvelle opportunité
  async createOpportunity(opportunityData, companyId) {
    const db = database;
    
    const opportunity = {
      id: require('uuid').v4(),
      ...opportunityData,
      company_id: companyId,
      status: opportunityData.status || 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await db.run(`
      INSERT INTO opportunities (
        id, company_id, title, description, amount, probability, status,
        stage_id, contact_id, assigned_to, close_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      opportunity.id, opportunity.company_id, opportunity.title, opportunity.description,
      opportunity.amount, opportunity.probability, opportunity.status,
      opportunity.stage_id, opportunity.contact_id, opportunity.assigned_to,
      opportunity.close_date, opportunity.created_at, opportunity.updated_at
    ]);
    
    return opportunity;
  }

  // Mettre à jour une opportunité
  async updateOpportunity(id, updateData, companyId) {
    const db = database;
    
    const setClause = [];
    const params = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        setClause.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });
    
    if (setClause.length === 0) return null;
    
    setClause.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id, companyId);
    
    await db.run(`
      UPDATE opportunities 
      SET ${setClause.join(', ')}
      WHERE id = ? AND company_id = ?
    `, params);
    
    return await db.get('SELECT * FROM opportunities WHERE id = ? AND company_id = ?', [id, companyId]);
  }

  // Supprimer une opportunité (soft delete)
  async deleteOpportunity(id, companyId) {
    const db = database;
    await db.run(
      'UPDATE opportunities SET status = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      ['archived', new Date().toISOString(), id, companyId]
    );
  }

  // Obtenir les statistiques des opportunités
  async getOpportunitiesStats(companyId) {
    const db = database;
    
    const results = await db.all(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total_value
      FROM opportunities 
      WHERE company_id = ? AND status != 'archived'
      GROUP BY status
    `, [companyId]);
    
    const stats = {
      total: 0,
      open: 0,
      won: 0,
      lost: 0,
      total_value: 0,
      won_value: 0
    };
    
    results.forEach(result => {
      stats[result.status] = result.count;
      stats.total += result.count;
      stats.total_value += result.total_value || 0;
      
      if (result.status === 'won') {
        stats.won_value = result.total_value || 0;
      }
    });
    
    return stats;
  }

  // ===== GESTION DES CONTACTS (DÉJÀ IMPLEMENTÉE) =====
  
  async createContact(contactData, companyId) {
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
    const db = database;
    await db.run(
      'UPDATE contacts SET status = ?, updated_at = ? WHERE id = ? AND company_id = ?',
      ['archived', new Date().toISOString(), id, companyId]
    );
  }

  async getContactsStats(companyId) {
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
