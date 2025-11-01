import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ollama } from 'ollama';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';
import { Account } from '../../accounting/entities/account.entity';

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
  ) {
    // Initialiser Ollama avec connexion locale
    this.ollama = new Ollama({ host: 'http://localhost:11434' });
  }

  /**
   * Génère une réponse intelligente basée sur les vraies données comptables
   */
  async generateIntelligentResponse(
    question: string,
    companyId: string,
  ): Promise<string> {
    try {
      this.logger.log(`🤖 Question reçue: "${question.substring(0, 100)}..."`);

      // Étape 1: Analyser la question et déterminer le contexte nécessaire
      const context = await this.getRelevantContext(question, companyId);

      this.logger.log(`📊 Contexte récupéré: ${context.substring(0, 200)}...`);

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

      this.logger.log(`✅ Réponse IA générée (${response.response.length} caractères)`);

      return response.response;
    } catch (error) {
      this.logger.error(`❌ Erreur Ollama RAG:`, error);
      
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

    // Si aucun contexte spécifique, donner un aperçu général
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
      treasuryBalance += account.balance || 0;
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
      if (account.accountNumber === '4457') {
        vatCollected = account.balance || 0;
      } else if (account.accountNumber === '4456') {
        vatDeductible = account.balance || 0;
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

    const receivables = clientAccount?.balance || 0;
    const payables = supplierAccount?.balance || 0;

    return `CRÉANCES ET DETTES:
- Créances clients (411): ${receivables.toFixed(2)} FCFA
- Dettes fournisseurs (401): ${payables.toFixed(2)} FCFA
- Ratio créances/dettes: ${payables > 0 ? (receivables / payables).toFixed(2) : 'N/A'}`;
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
- Système: ERP MERP avec plan comptable OHADA/SYSCOHADA`;
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
7. Utilise des emojis (📊 💰 ⚠️) pour rendre la réponse plus lisible

RÉPONSE:`;
  }

  /**
   * Réponse de fallback si Ollama indisponible
   */
  private getFallbackResponse(question: string): string {
    return `Je traite votre question : "${question}"

⚠️ Service d'IA temporairement limité. Je peux cependant vous aider avec :

• Accéder à vos données comptables réelles dans le dashboard
• Générer vos déclarations de TVA
• Analyser votre trésorerie et vos ratios
• Consulter vos écritures et états comptables

Utilisez les modules spécifiques pour une analyse détaillée, ou reformulez votre question.`;
  }
}
