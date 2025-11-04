import { Injectable, Logger } from '@nestjs/common';

/**
 * Service fallback pour Google Cloud Vision
 * Évite les erreurs TypeScript quand @google-cloud/vision n'est pas installé
 */
@Injectable()
export class GoogleVisionFallbackService {
  private readonly logger = new Logger(GoogleVisionFallbackService.name);

  /**
   * Extraction texte fallback (simulation)
   */
  async extractText(fileBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    this.logger.warn('⚠️ Google Vision non disponible - Mode fallback activé');
    return {
      text: 'Mode fallback - Google Cloud Vision nécessite installation et configuration',
      confidence: 0,
    };
  }

  /**
   * Classification document fallback
   */
  async classifyDocument(fileBuffer: Buffer): Promise<string> {
    this.logger.warn('⚠️ Google Vision non disponible - Classification fallback');
    return 'other';
  }

  /**
   * Extraction structurée fallback
   */
  async extractStructuredData(fileBuffer: Buffer, documentType: string): Promise<any> {
    this.logger.warn('⚠️ Google Vision non disponible - Extraction structurée fallback');
    return {
      text: 'Mode fallback - Google Cloud Vision nécessite installation',
      confidence: 0,
      extractedAt: new Date().toISOString(),
      ocrEngine: 'google-vision-fallback',
    };
  }

  /**
   * Vérifier disponibilité Google Vision
   */
  isAvailable(): boolean {
    return false; // Toujours false pour le fallback
  }
}
