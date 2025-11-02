import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { Ollama } from 'ollama';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';
import { Account } from '../../accounting/entities/account.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../auth/entities/user.entity';

@Injectable()
export class OllamaRAGService {
  private readonly logger = new Logger(OllamaRAGService.name);
  private ollama: Ollama;

  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private readonly journalLineRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    // Initialiser Ollama avec connexion configurable (Railway ou local)
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
    this.logger.log(` Connexion à Ollama: ${ollamaHost}`);
    this.ollama = new Ollama({ host: ollamaHost });
  }

  /**
   * Génère une réponse intelligente basée sur les vraies données comptables
   */
  async generateIntelligentResponse(
    question: string,
    companyId: string,
  ): Promise<string> {
    try {
      this.logger.log(` Question reçue: "${question.substring(0, 100)}..."`);

      // Étape 1: Analyser la question et déterminer le contexte nécessaire
      const context = await this.getRelevantContext(question, companyId);

      this.logger.log(` Contexte récupéré: ${context.substring(0, 200)}...`);

      // Étape 2: Construire le prompt avec contexte
      const prompt = this.buildPrompt(question, context);

      // Étape 3: Appeler Ollama avec streaming
      const response = await this.ollama.generate({
        model: 'qwen2.5:7b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_ctx: 4096, // Contexte plus large
        },
      });

      this.logger.log(` Réponse IA générée (${response.response.length} caractères)`);

      return response.response;
    } catch (error) {
      this.logger.error(` Erreur Ollama RAG:`, error);
      
      // Fallback sur réponses basiques si Ollama indisponible
      return this.getFallbackResponse(question);
    }
  }

  /**
   * Récupère le contexte pertinent depuis la base de données
   */
  private async getRelevantContext(
    question: string,
    companyId: string,
  ): Promise<string> {
    const lowerQuestion = question.toLowerCase();
    let contextParts: string[] = [];

    // Contexte: Trésorerie et ratios
    if (
      lowerQuestion.includes('trésorerie') ||
      lowerQuestion.includes('liquidité') ||
      lowerQuestion.includes('cash')
    ) {
      const treasuryData = await this.getTreasuryContext(companyId);
      contextParts.push(treasuryData);
    }

    // Contexte: TVA
    if (lowerQuestion.includes('tva') || lowerQuestion.includes('taxe')) {
      const vatData = await this.getVATContext(companyId);
      contextParts.push(vatData);
    }

    // Contexte: Résultats et P&L
    if (
      lowerQuestion.includes('résultat') ||
      lowerQuestion.includes('bénéfice') ||
      lowerQuestion.includes('perte') ||
      lowerQuestion.includes('profit')
    ) {
      const plData = await this.getProfitLossContext(companyId);
      contextParts.push(plData);
    }

    // Contexte: Clients et fournisseurs
    if (
      lowerQuestion.includes('client') ||
      lowerQuestion.includes('fournisseur') ||
      lowerQuestion.includes('créance') ||
      lowerQuestion.includes('dette')
    ) {
      const partiesData = await this.getPartiesContext(companyId);
      contextParts.push(partiesData);
    }

    // Contexte: Écritures récentes
    if (
      lowerQuestion.includes('écriture') ||
      lowerQuestion.includes('journal') ||
      lowerQuestion.includes('comptable')
    ) {
      const recentEntries = await this.getRecentEntriesContext(companyId);
      contextParts.push(recentEntries);
    }

    // Contexte: Ventes et revenus
    if (
      lowerQuestion.includes('vente') ||
      lowerQuestion.includes('revenu') ||
      lowerQuestion.includes('chiffre d\'affaires') ||
      lowerQuestion.includes('ca ')
    ) {
      const salesData = await this.getSalesContext(companyId);
      contextParts.push(salesData);
    }

    // Contexte: Achats et dépenses
    if (
      lowerQuestion.includes('achat') ||
      lowerQuestion.includes('dépense') ||
      lowerQuestion.includes('coût') ||
      lowerQuestion.includes('charge')
    ) {
      const purchasesData = await this.getPurchasesContext(companyId);
      contextParts.push(purchasesData);
    }

    // Contexte: Budget
    if (
      lowerQuestion.includes('budget') ||
      lowerQuestion.includes('prévision') ||
      lowerQuestion.includes('planif')
    ) {
      const budgetData = await this.getBudgetContext(companyId);
      contextParts.push(budgetData);
    }

    // Contexte: Performance globale et KPIs
    if (
      lowerQuestion.includes('performance') ||
      lowerQuestion.includes('kpi') ||
      lowerQuestion.includes('indicateur') ||
      lowerQuestion.includes('tableau de bord') ||
      lowerQuestion.includes('dashboard')
    ) {
      const performanceData = await this.getPerformanceContext(companyId);
      contextParts.push(performanceData);
    }

    // Contexte: Clôture et états comptables
    if (
      lowerQuestion.includes('clôture') ||
      lowerQuestion.includes('balance') ||
      lowerQuestion.includes('bilan')
    ) {
      const closureData = await this.getClosureContext(companyId);
      contextParts.push(closureData);
    }

    // Contexte: Entreprise et profil
    if (
      lowerQuestion.includes('entreprise') ||
      lowerQuestion.includes('société') ||
      lowerQuestion.includes('company') ||
      lowerQuestion.includes('profil')
    ) {
      const companyData = await this.getCompanyContext(companyId);
      contextParts.push(companyData);
    }

    // Contexte: Utilisateurs et activité
    if (
      lowerQuestion.includes('utilisateur') ||
      lowerQuestion.includes('équipe') ||
      lowerQuestion.includes('activité') ||
      lowerQuestion.includes('qui a')
    ) {
      const activityData = await this.getActivityContext(companyId);
      contextParts.push(activityData);
    }

    // Si aucun contexte spécifique, donner un aperçu général complet
    if (contextParts.length === 0) {
      const overview = await this.getGeneralOverview(companyId);
      contextParts.push(overview);
    }

    return contextParts.join('\n\n');
  }

  /**
   * Contexte trésorerie
   */
  private async getTreasuryContext(companyId: string): Promise<string> {
    // Comptes de banque (512) et caisse (531)
    const bankAccounts = await this.accountRepo.find({
      where: [
        { companyId, accountNumber: '512' },
        { companyId, accountNumber: '531' },
      ],
    });

    if (bankAccounts.length === 0) {
      return 'TRÉSORERIE: Aucun compte de banque ou caisse trouvé.';
    }

    let treasuryBalance = 0;
    for (const account of bankAccounts) {
      const balance = parseFloat(String(account.balance || '0'));
      treasuryBalance += isNaN(balance) ? 0 : balance;
    }

    // Calculer évolution des 3 derniers mois
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentEntries = await this.journalEntryRepo
      .createQueryBuilder('entry')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate >= :date', {
        date: threeMonthsAgo.toISOString(),
      })
      .getCount();

    return `TRÉSORERIE ACTUELLE:
- Solde banque + caisse: ${treasuryBalance.toFixed(2)} FCFA
- Nombre de comptes: ${bankAccounts.length}
- Mouvements des 3 derniers mois: ${recentEntries} écritures`;
  }

  /**
   * Contexte TVA
   */
  private async getVATContext(companyId: string): Promise<string> {
    // TVA collectée (4457) et déductible (4456)
    const vatAccounts = await this.accountRepo.find({
      where: [
        { companyId, accountNumber: '4457' },
        { companyId, accountNumber: '4456' },
      ],
    });

    let vatCollected = 0;
    let vatDeductible = 0;

    for (const account of vatAccounts) {
      const balance = parseFloat(String(account.balance || '0'));
      if (account.accountNumber === '4457') {
        vatCollected = isNaN(balance) ? 0 : balance;
      } else if (account.accountNumber === '4456') {
        vatDeductible = isNaN(balance) ? 0 : balance;
      }
    }

    const vatNet = vatCollected - vatDeductible;

    return `TVA ACTUELLE:
- TVA collectée (4457): ${vatCollected.toFixed(2)} FCFA
- TVA déductible (4456): ${vatDeductible.toFixed(2)} FCFA
- TVA nette à payer: ${vatNet.toFixed(2)} FCFA`;
  }

  /**
   * Contexte Profit & Loss
   */
  private async getProfitLossContext(companyId: string): Promise<string> {
    // Calculer mois en cours
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lines = await this.journalLineRepo
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.entry', 'entry')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate >= :startDate', {
        startDate: startOfMonth.toISOString(),
      })
      .getMany();

    let revenue = 0;
    let expenses = 0;

    for (const line of lines) {
      if (!line.account) continue;

      const accountClass = line.account.accountNumber?.charAt(0);

      // Classe 7 = Produits
      if (accountClass === '7') {
        revenue += line.credit - line.debit;
      }

      // Classe 6 = Charges
      if (accountClass === '6') {
        expenses += line.debit - line.credit;
      }
    }

    const netIncome = revenue - expenses;
    const margin = revenue > 0 ? ((netIncome / revenue) * 100).toFixed(1) : '0.0';

    return `RÉSULTATS DU MOIS EN COURS:
- Produits (classe 7): ${revenue.toFixed(2)} FCFA
- Charges (classe 6): ${expenses.toFixed(2)} FCFA
- Résultat net: ${netIncome.toFixed(2)} FCFA
- Marge: ${margin}%`;
  }

  /**
   * Contexte clients et fournisseurs
   */
  private async getPartiesContext(companyId: string): Promise<string> {
    // Compte clients 411
    const clientAccount = await this.accountRepo.findOne({
      where: { companyId, accountNumber: '411' },
    });

    // Compte fournisseurs 401
    const supplierAccount = await this.accountRepo.findOne({
      where: { companyId, accountNumber: '401' },
    });

    const receivables = parseFloat(String(clientAccount?.balance || '0'));
    const payables = parseFloat(String(supplierAccount?.balance || '0'));
    const finalReceivables = isNaN(receivables) ? 0 : receivables;
    const finalPayables = isNaN(payables) ? 0 : payables;

    return `CRÉANCES ET DETTES:
- Créances clients (411): ${finalReceivables.toFixed(2)} FCFA
- Dettes fournisseurs (401): ${finalPayables.toFixed(2)} FCFA
- Ratio créances/dettes: ${finalPayables > 0 ? (finalReceivables / finalPayables).toFixed(2) : 'N/A'}`;
  }

  /**
   * Contexte écritures récentes
   */
  private async getRecentEntriesContext(companyId: string): Promise<string> {
    const recentEntries = await this.journalEntryRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    if (recentEntries.length === 0) {
      return 'ÉCRITURES RÉCENTES: Aucune écriture trouvée.';
    }

    const entriesStr = recentEntries
      .map(
        (e, idx) =>
          `${idx + 1}. ${e.entryDate ? new Date(e.entryDate).toLocaleDateString('fr-FR') : 'N/A'} - ${e.description || 'Sans description'} (${e.status})`,
      )
      .join('\n');

    return `ÉCRITURES RÉCENTES (5 dernières):\n${entriesStr}`;
  }

  /**
   * Aperçu général de la société
   */
  private async getGeneralOverview(companyId: string): Promise<string> {
    const totalEntries = await this.journalEntryRepo.count({
      where: { companyId },
    });
    const totalAccounts = await this.accountRepo.count({
      where: { companyId },
    });

    return `APERÇU GÉNÉRAL:
- Total écritures comptables: ${totalEntries}
- Total comptes dans le plan comptable: ${totalAccounts}
- Système: ERP BMS avec plan comptable OHADA/SYSCOHADA`;
  }

  /**
   * Contexte Ventes et revenus
   */
  private async getSalesContext(companyId: string): Promise<string> {
    // Analyser les ventes (compte 707, 706, classe 7)
    const salesAccounts = await this.accountRepo
      .createQueryBuilder('account')
      .where('account.companyId = :companyId', { companyId })
      .andWhere('account.accountNumber LIKE :pattern', { pattern: '7%' })
      .getMany();

    let totalSales = 0;
    let accountDetails = [];

    for (const account of salesAccounts.slice(0, 5)) {
      // Top 5
      const balance = parseFloat(String(account.balance || '0'));
      totalSales += isNaN(balance) ? 0 : balance;
      accountDetails.push(
        `  • ${account.accountNumber} - ${account.accountName || 'N/A'}: ${balance.toFixed(2)} FCFA`,
      );
    }

    // Calculer CA des 3 derniers mois
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentSalesCount = await this.journalLineRepo
      .createQueryBuilder('line')
      .leftJoin('line.entry', 'entry')
      .leftJoin('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('account.accountNumber LIKE :pattern', { pattern: '7%' })
      .andWhere('entry.entryDate >= :date', {
        date: threeMonthsAgo.toISOString(),
      })
      .getCount();

    return `VENTES ET CHIFFRE D'AFFAIRES:
- Total produits (classe 7): ${totalSales.toFixed(2)} FCFA
- Nombre de transactions 3 derniers mois: ${recentSalesCount}

Principaux comptes de produits:
${accountDetails.length > 0 ? accountDetails.join('\n') : '  Aucun compte de produits trouvé'}`;
  }

  /**
   * Contexte Achats et dépenses
   */
  private async getPurchasesContext(companyId: string): Promise<string> {
    // Analyser les achats (compte 607, 601-608, classe 6)
    const purchaseAccounts = await this.accountRepo
      .createQueryBuilder('account')
      .where('account.companyId = :companyId', { companyId })
      .andWhere('account.accountNumber LIKE :pattern', { pattern: '6%' })
      .getMany();

    let totalPurchases = 0;
    let accountDetails = [];

    for (const account of purchaseAccounts.slice(0, 5)) {
      // Top 5
      const balance = parseFloat(String(account.balance || '0'));
      totalPurchases += isNaN(balance) ? 0 : balance;
      accountDetails.push(
        `  • ${account.accountNumber} - ${account.accountName || 'N/A'}: ${balance.toFixed(2)} FCFA`,
      );
    }

    // Compte fournisseurs (401)
    const supplierAccount = await this.accountRepo.findOne({
      where: { companyId, accountNumber: '401' },
    });

    const supplierBalance = parseFloat(String(supplierAccount?.balance || '0'));
    const finalSupplierBalance = isNaN(supplierBalance) ? 0 : supplierBalance;

    return `ACHATS ET DÉPENSES:
- Total charges (classe 6): ${totalPurchases.toFixed(2)} FCFA
- Dettes fournisseurs (401): ${finalSupplierBalance.toFixed(2)} FCFA

Principaux comptes de charges:
${accountDetails.length > 0 ? accountDetails.join('\n') : '  Aucun compte de charges trouvé'}`;
  }

  /**
   * Contexte Budget et prévisions
   */
  private async getBudgetContext(companyId: string): Promise<string> {
    // Calculer budget basé sur moyenne 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const lines = await this.journalLineRepo
      .createQueryBuilder('line')
      .leftJoin('line.entry', 'entry')
      .leftJoin('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate >= :startDate', {
        startDate: sixMonthsAgo.toISOString(),
      })
      .getMany();

    let avgMonthlyRevenue = 0;
    let avgMonthlyExpenses = 0;
    const monthsData = new Map<string, { revenue: number; expenses: number }>();

    for (const line of lines) {
      if (!line.account) continue;

      // La relation entry devrait être chargée par le leftJoin
      const entryDate = (line as any).entry?.entryDate;
      if (!entryDate) continue;

      const monthKey = new Date(entryDate)
        .toISOString()
        .substring(0, 7);
      if (!monthsData.has(monthKey)) {
        monthsData.set(monthKey, { revenue: 0, expenses: 0 });
      }

      const accountClass = line.account.accountNumber?.charAt(0);
      const monthData = monthsData.get(monthKey);

      if (accountClass === '7') {
        monthData.revenue += line.credit - line.debit;
      } else if (accountClass === '6') {
        monthData.expenses += line.debit - line.credit;
      }
    }

    if (monthsData.size > 0) {
      let totalRevenue = 0;
      let totalExpenses = 0;
      monthsData.forEach((data) => {
        totalRevenue += data.revenue;
        totalExpenses += data.expenses;
      });
      avgMonthlyRevenue = totalRevenue / monthsData.size;
      avgMonthlyExpenses = totalExpenses / monthsData.size;
    }

    const projectedNextMonth = avgMonthlyRevenue - avgMonthlyExpenses;

    return `BUDGET ET PRÉVISIONS (basé sur 6 derniers mois):
- Chiffre d'affaires moyen mensuel: ${avgMonthlyRevenue.toFixed(2)} FCFA
- Charges moyennes mensuelles: ${avgMonthlyExpenses.toFixed(2)} FCFA
- Résultat net moyen mensuel: ${(avgMonthlyRevenue - avgMonthlyExpenses).toFixed(2)} FCFA
- Projection mois prochain: ${projectedNextMonth.toFixed(2)} FCFA
- Nombre de mois analysés: ${monthsData.size}`;
  }

  /**
   * Contexte Performance et KPIs
   */
  private async getPerformanceContext(companyId: string): Promise<string> {
    // Calculer les KPIs des 12 derniers mois
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const lines = await this.journalLineRepo
      .createQueryBuilder('line')
      .leftJoin('line.entry', 'entry')
      .leftJoin('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate >= :startDate', {
        startDate: twelveMonthsAgo.toISOString(),
      })
      .getMany();

    let totalRevenue = 0;
    let totalExpenses = 0;

    for (const line of lines) {
      if (!line.account) continue;
      const accountClass = line.account.accountNumber?.charAt(0);

      if (accountClass === '7') {
        totalRevenue += line.credit - line.debit;
      } else if (accountClass === '6') {
        totalExpenses += line.debit - line.credit;
      }
    }

    const netIncome = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : '0.0';

    // Ratios financiers
    const accounts = await this.accountRepo.find({ where: { companyId } });

    let currentAssets = 0;
    let currentLiabilities = 0;
    let equity = 0;

    for (const account of accounts) {
      const accountClass = account.accountNumber?.charAt(0);
      const accountType = (account as any).type;
      const balance = parseFloat(String(account.balance || '0'));
      const finalBalance = isNaN(balance) ? 0 : balance;
      
      if (['3', '4', '5'].includes(accountClass) && accountType === 'asset') {
        currentAssets += finalBalance;
      } else if (
        ['4', '5'].includes(accountClass) &&
        accountType === 'liability'
      ) {
        currentLiabilities += finalBalance;
      } else if (accountClass === '1') {
        equity += finalBalance;
      }
    }

    const liquidityRatio =
      currentLiabilities > 0
        ? (currentAssets / currentLiabilities).toFixed(2)
        : 'N/A';

    return `PERFORMANCE ET KPIs (12 derniers mois):
- Chiffre d'affaires annuel: ${totalRevenue.toFixed(2)} FCFA
- Charges annuelles: ${totalExpenses.toFixed(2)} FCFA
- Résultat net annuel: ${netIncome.toFixed(2)} FCFA
- Marge nette: ${margin}%

RATIOS FINANCIERS:
- Ratio de liquidité: ${liquidityRatio}
- Actif circulant: ${currentAssets.toFixed(2)} FCFA
- Passif circulant: ${currentLiabilities.toFixed(2)} FCFA
- Capitaux propres: ${equity.toFixed(2)} FCFA`;
  }

  /**
   * Contexte Clôture et états comptables
   */
  private async getClosureContext(companyId: string): Promise<string> {
    // Compte 120 (Résultat)
    const resultAccount = await this.accountRepo.findOne({
      where: { companyId, accountNumber: '120' },
    });

    const resultBalance = parseFloat(String(resultAccount?.balance || '0'));
    const lastClosureResult = isNaN(resultBalance) ? 0 : resultBalance;

    // Nombre d'écritures en brouillon
    const draftCount = await this.journalEntryRepo.count({
      where: { companyId, status: 'draft' },
    });

    // Total des comptes
    const totalAccounts = await this.accountRepo.count({ where: { companyId } });

    return `CLÔTURE ET ÉTATS COMPTABLES:
- Résultat dernière clôture (120): ${lastClosureResult.toFixed(2)} FCFA
- Écritures en brouillon: ${draftCount}
- Total comptes dans le plan comptable: ${totalAccounts}
- Plan comptable: OHADA/SYSCOHADA
- ${draftCount > 0 ? ' Attention: écritures en brouillon à valider avant clôture' : ' Toutes les écritures sont validées'}`;
  }

  /**
   * Contexte Entreprise et profil
   */
  private async getCompanyContext(companyId: string): Promise<string> {
    const company = await this.companyRepo.findOne({
      where: { id: companyId },
    });

    if (!company) {
      return 'ENTREPRISE: Informations non disponibles';
    }

    return `INFORMATIONS ENTREPRISE:
- Nom: ${company.name || 'N/A'}
- Forme juridique: ${(company as any).legalForm || 'N/A'}
- RCCM: ${(company as any).rccm || 'N/A'}
- IFU: ${(company as any).ifu || 'N/A'}
- Taux TVA: ${company.vatRate || 18}%
- Adresse: ${(company as any).address || 'N/A'}
- Téléphone: ${company.phone || 'N/A'}
- Email: ${company.email || 'N/A'}`;
  }

  /**
   * Contexte Utilisateurs et activité
   */
  private async getActivityContext(companyId: string): Promise<string> {
    // Nombre d'utilisateurs
    const userCount = await this.userRepo.count();

    // Dernières écritures avec créateur
    const recentEntries = await this.journalEntryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.createdBy', 'user')
      .where('entry.companyId = :companyId', { companyId })
      .orderBy('entry.createdAt', 'DESC')
      .take(5)
      .getMany();

    const activityStr = recentEntries
      .map((e, idx) => {
        const userName = (e.createdBy as any)?.name || (e.createdBy as any)?.email || 'Utilisateur inconnu';
        const date = e.createdAt
          ? new Date(e.createdAt).toLocaleDateString('fr-FR')
          : 'N/A';
        return `  ${idx + 1}. ${date} - ${e.description || 'Sans description'} par ${userName}`;
      })
      .join('\n');

    return `UTILISATEURS ET ACTIVITÉ:
- Nombre d'utilisateurs actifs: ${userCount}

Dernières activités (5):
${activityStr || '  Aucune activité récente'}`;
  }

  /**
   * Construit le prompt pour Ollama avec le contexte
   */
  private buildPrompt(question: string, context: string): string {
    return `Tu es un assistant comptable expert pour un ERP de gestion d'entreprise utilisant le plan comptable OHADA/SYSCOHADA.

CONTEXTE COMPTABLE ACTUEL DE L'ENTREPRISE:
${context}

QUESTION DE L'UTILISATEUR:
${question}

INSTRUCTIONS:
1. Utilise UNIQUEMENT les données du contexte comptable fourni ci-dessus
2. Réponds en français de manière claire et professionnelle
3. Si tu donnes des chiffres, cite-les exactement depuis le contexte
4. Si l'information n'est pas dans le contexte, dis-le clairement
5. Donne des recommandations concrètes et actionnables
6. Structure ta réponse avec des puces ou numéros si pertinent
7. Utilise des emojis (  ) pour rendre la réponse plus lisible

RÉPONSE:`;
  }

  /**
   * Réponse de fallback si Ollama indisponible
   */
  private getFallbackResponse(question: string): string {
    return `Je traite votre question : "${question}"

 Service d'IA temporairement limité. Je peux cependant vous aider avec :

• Accéder à vos données comptables réelles dans le dashboard
• Générer vos déclarations de TVA
• Analyser votre trésorerie et vos ratios
• Consulter vos écritures et états comptables

Utilisez les modules spécifiques pour une analyse détaillée, ou reformulez votre question.`;
  }
}
