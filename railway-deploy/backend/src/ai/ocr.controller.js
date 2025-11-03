const OCRService = require('./ocr.service');
const multer = require('multer');

// Configuration multer pour upload mémoire
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non supporté. Utilisez JPG, PNG ou PDF.'));
    }
  }
});

class OCRController {
  constructor() {
    this.ocrService = new OCRService();
  }

  /**
   * POST /api/v1/ai/ocr/:type
   * Extrait données d'un document avec OCR
   * 
   * @param {string} type - Type de document: invoice, receipt, bank_statement
   * @param {file} file - Fichier à analyser (multipart/form-data)
   */
  async extractDocument(req, res) {
    try {
      const { type } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Aucun fichier fourni'
        });
      }

      if (!['invoice', 'receipt', 'bank_statement'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type invalide. Utilisez: invoice, receipt, bank_statement'
        });
      }

      console.log(`[OCR Controller] Extraction ${type} - ${file.originalname}`);

      const result = await this.ocrService.extractDocument(
        file.buffer,
        type,
        file.originalname
      );

      res.json(result);
    } catch (error) {
      console.error('[OCR Controller] Erreur:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur extraction OCR'
      });
    }
  }

  /**
   * GET /api/v1/ai/ocr/stats
   * Obtenir statistiques d'utilisation OCR
   */
  async getStats(req, res) {
    try {
      const stats = this.ocrService.getStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('[OCR Controller] Erreur stats:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/v1/ai/ocr/test
   * Tester la configuration OCR
   */
  async testConfiguration(req, res) {
    try {
      const config = {
        googleVision: !!process.env.GOOGLE_VISION_API_KEY,
        ocrSpace: !!process.env.OCR_SPACE_API_KEY
      };

      if (!config.googleVision && !config.ocrSpace) {
        return res.status(400).json({
          success: false,
          error: 'Aucune clé API configurée',
          config
        });
      }

      res.json({
        success: true,
        message: 'Configuration OCR valide',
        config,
        stats: this.ocrService.getStats()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Middleware multer pour upload
   */
  getUploadMiddleware() {
    return upload.single('file');
  }
}

module.exports = OCRController;
