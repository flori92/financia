const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testOCRSpace() {
  try {
    console.log('🧪 Test OCR.space API direct...');
    
    // Créer un PDF de test simple
    const testPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(FACTURE TEST) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000054 00000 n\n0000000123 00000 n\n0000000301 00000 n\ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n396\n%%EOF');
    
    const formData = new FormData();
    formData.append('file', testPdfBuffer, 'test.pdf');
    formData.append('language', 'fr');
    formData.append('isOverlayRequired', 'false');
    
    console.log('📤 Envoi requête à OCR.space...');
    
    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        'apikey': 'helloworld',
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Réponse OCR.space:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erreur OCR.space:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testOCRSpace();
