/**
 * Rapport de validation des handlers de boutons
 * Génère un rapport complet de l'état des handlers dans le projet
 */

import { validatePageHandlers, generateHandlerReport } from './validate-handlers';
import type { HandlerValidation } from './validate-handlers';

export interface HandlerReport {
  page: string;
  totalHandlers: number;
  implementedHandlers: number;
  completionRate: number;
  qualityScore: number;
  handlers: HandlerValidation[];
  lastValidated: Date;
}

export class HandlerReporter {
  private reports: Map<string, HandlerReport> = new Map();

  /**
   * Valide tous les handlers d'une page et génère un rapport
   */
  validatePage(pagePath: string): HandlerReport {
    const validations = validatePageHandlers(pagePath);
    const report = generateHandlerReport(validations);
    
    const handlerReport: HandlerReport = {
      page: pagePath,
      totalHandlers: report.total,
      implementedHandlers: report.implemented,
      completionRate: report.completionRate,
      qualityScore: report.qualityScore,
      handlers: validations,
      lastValidated: new Date()
    };

    this.reports.set(pagePath, handlerReport);
    return handlerReport;
  }

  /**
   * Valide toutes les pages principales du projet
   */
  validateAllPages(): HandlerReport[] {
    const mainPages = [
      '/inventory',
      '/purchases/orders',
      '/purchases/suppliers',
      '/accountant',
      '/accountant/bank',
      '/accountant/aged-balance',
      '/accountant/chart-of-accounts',
      '/accountant/journal',
      '/accountant/trial-balance',
      '/accountant/profit-loss',
      '/accountant/balance-sheet',
      '/treasury',
      '/dashboard'
    ];

    return mainPages.map(page => this.validatePage(page));
  }

  /**
   * Génère un rapport global de tous les handlers
   */
  generateGlobalReport(): {
    totalPages: number;
    totalHandlers: number;
    totalImplemented: number;
    averageCompletionRate: number;
    averageQualityScore: number;
    criticalIssues: HandlerValidation[];
    pages: HandlerReport[];
  } {
    const reports = this.validateAllPages();
    
    const totalHandlers = reports.reduce((sum, report) => sum + report.totalHandlers, 0);
    const totalImplemented = reports.reduce((sum, report) => sum + report.implementedHandlers, 0);
    const averageCompletionRate = Math.round(
      reports.reduce((sum, report) => sum + report.completionRate, 0) / reports.length
    );
    const averageQualityScore = Math.round(
      reports.reduce((sum, report) => sum + report.qualityScore, 0) / reports.length
    );

    const criticalIssues = reports.flatMap(report => 
      report.handlers.filter(handler => !handler.isImplemented)
    );

    return {
      totalPages: reports.length,
      totalHandlers,
      totalImplemented,
      averageCompletionRate,
      averageQualityScore,
      criticalIssues,
      pages: reports
    };
  }

  /**
   * Affiche le rapport dans la console
   */
  logGlobalReport(): void {
    const report = this.generateGlobalReport();
    
    console.group('📊 RAPPORT GLOBAL DES HANDLERS DE BOUTONS');
    console.log(`📈 Pages analysées: ${report.totalPages}`);
    console.log(`🔘 Handlers totaux: ${report.totalHandlers}`);
    console.log(`✅ Handlers implémentés: ${report.totalImplemented}`);
    console.log(`📊 Taux de complétion moyen: ${report.averageCompletionRate}%`);
    console.log(`⭐ Score de qualité moyen: ${report.averageQualityScore}%`);
    
    if (report.criticalIssues.length > 0) {
      console.group('⚠️ Problèmes critiques:');
      report.criticalIssues.forEach(issue => {
        console.log(`❌ ${issue.page} - ${issue.handlerName}: Non implémenté`);
      });
      console.groupEnd();
    }
    
    console.group('📋 Détail par page:');
    report.pages.forEach(pageReport => {
      const status = pageReport.completionRate === 100 ? '✅' : 
                    pageReport.completionRate >= 75 ? '⚠️' : '❌';
      console.log(`${status} ${pageReport.page}: ${pageReport.completionRate}% (${pageReport.implementedHandlers}/${pageReport.totalHandlers})`);
    });
    console.groupEnd();
    
    console.groupEnd();
  }

  /**
   * Exporte le rapport en format JSON
   */
  exportReport(): string {
    const report = this.generateGlobalReport();
    return JSON.stringify(report, null, 2);
  }

  /**
   * Sauvegarde le rapport dans le localStorage
   */
  saveReport(): void {
    if (typeof window !== 'undefined') {
      const report = this.generateGlobalReport();
      localStorage.setItem('handlers-report', this.exportReport());
      localStorage.setItem('handlers-report-date', new Date().toISOString());
    }
  }

  /**
   * Vérifie si une page a tous ses handlers fonctionnels
   */
  isPageFullyFunctional(pagePath: string): boolean {
    const report = this.reports.get(pagePath) || this.validatePage(pagePath);
    return report.completionRate === 100 && report.qualityScore >= 90;
  }

  /**
   * Retourne la liste des pages qui nécessitent une attention
   */
  getPagesNeedingAttention(): string[] {
    const reports = this.validateAllPages();
    return reports
      .filter(report => report.completionRate < 100 || report.qualityScore < 90)
      .map(report => report.page);
  }

  /**
   * Génère des recommandations d'amélioration
   */
  generateRecommendations(): string[] {
    const report = this.generateGlobalReport();
    const recommendations: string[] = [];

    if (report.averageCompletionRate < 100) {
      recommendations.push(`🔧 Implémenter les ${report.totalHandlers - report.totalImplemented} handlers manquants`);
    }

    if (report.averageQualityScore < 90) {
      recommendations.push('🛡️ Améliorer la gestion des erreurs dans les handlers existants');
    }

    const pagesWithIssues = this.getPagesNeedingAttention();
    if (pagesWithIssues.length > 0) {
      recommendations.push(`📝 Prioriser les pages: ${pagesWithIssues.join(', ')}`);
    }

    const criticalIssues = report.criticalIssues.length;
    if (criticalIssues > 0) {
      recommendations.push(`🚨 Résoudre les ${criticalIssues} problèmes critiques identifiés`);
    }

    if (recommendations.length === 0) {
      recommendations.push('🎉 Tous les handlers sont fonctionnels! Continuez comme ça!');
    }

    return recommendations;
  }
}

// Instance singleton du reporter
export const handlerReporter = new HandlerReporter();

/**
 * Fonction utilitaire pour valider automatiquement au chargement
 */
export const autoValidateAndReport = (): void => {
  if (typeof window !== 'undefined') {
    // Valider la page actuelle
    const currentPath = window.location.pathname;
    handlerReporter.validatePage(currentPath);
    
    // Générer et afficher le rapport global
    handlerReporter.logGlobalReport();
    
    // Sauvegarder le rapport
    handlerReporter.saveReport();
    
    // Afficher les recommandations
    const recommendations = handlerReporter.generateRecommendations();
    console.log('💡 Recommandations:', recommendations);
  }
};

export default handlerReporter;
