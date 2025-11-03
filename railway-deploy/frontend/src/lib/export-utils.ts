/**
 * Utilitaires d'export professionnel pour BMS
 * Formats : CSV, Excel (HTML), PDF (HTML stylisé)
 */

export interface ExportData {
  title: string;
  headers: string[];
  rows: string[][] | { [key: string]: any }[];
  metadata?: {
    date: string;
    author?: string;
    company?: string;
    period?: string;
  };
}

export class ProfessionalExporter {
  /**
   * Export CSV formaté avec en-têtes
   */
  static exportCSV(data: ExportData, filename?: string) {
    let csv = '';
    
    // En-tête du document
    csv += `"${data.title}"\n`;
    csv += `"Généré le: ${data.metadata?.date || new Date().toLocaleDateString('fr-FR')}"\n`;
    if (data.metadata?.company) csv += `"Entreprise: ${data.metadata.company}"\n`;
    if (data.metadata?.period) csv += `"Période: ${data.metadata.period}"\n`;
    csv += '\n';
    
    // En-têtes de colonnes
    csv += data.headers.map(h => `"${h}"`).join(';') + '\n';
    
    // Données
    data.rows.forEach(row => {
      if (Array.isArray(row)) {
        csv += row.map(cell => `"${cell}"`).join(';') + '\n';
      } else {
        csv += data.headers.map(header => `"${row[header] || ''}"`).join(';') + '\n';
      }
    });
    
    // Téléchargement
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || data.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export Excel (HTML) formaté avec styles
   */
  static exportExcel(data: ExportData, filename?: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; color: #333; }
    h1 { color: #1a472a; border-bottom: 3px solid #1a472a; padding-bottom: 10px; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .metadata p { margin: 5px 0; font-size: 14px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th { background: #1a472a; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { border: 1px solid #ddd; padding: 10px; }
    tr:nth-child(even) { background: #f9f9f9; }
    tr:hover { background: #f5f5f5; }
    .number { text-align: right; font-family: 'Courier New', monospace; }
    .total { background: #e8f5e8 !important; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>${data.title}</h1>
  <div class="metadata">
    <p><strong>Date:</strong> ${data.metadata?.date || new Date().toLocaleDateString('fr-FR')}</p>
    ${data.metadata?.company ? `<p><strong>Entreprise:</strong> ${data.metadata.company}</p>` : ''}
    ${data.metadata?.period ? `<p><strong>Période:</strong> ${data.metadata.period}</p>` : ''}
    ${data.metadata?.author ? `<p><strong>Généré par:</strong> ${data.metadata.author}</p>` : ''}
  </div>
  
  <table>
    <thead>
      <tr>
        ${data.headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.rows.map(row => {
        if (Array.isArray(row)) {
          return `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        } else {
          return `<tr>${data.headers.map(header => `<td class="${typeof row[header] === 'number' ? 'number' : ''}">${row[header] || ''}</td>`).join('')}</tr>`;
        }
      }).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Ce document a été généré par BMS - Business Management System</p>
    <p>${new Date().toLocaleString('fr-FR')}</p>
  </div>
</body>
</html>`;

    // Téléchargement
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || data.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export PDF (HTML stylisé pour impression)
   */
  static exportPDF(data: ExportData, filename?: string) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${data.title}</title>
  <style>
    @page { margin: 2cm; size: A4; }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #1a472a; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #1a472a; margin: 0; font-size: 24px; }
    .header p { margin: 5px 0; color: #666; font-size: 14px; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #1a472a; }
    .metadata p { margin: 5px 0; font-size: 14px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 12px; }
    th { background: #1a472a; color: white; padding: 10px; text-align: left; font-weight: 600; border: 1px solid #1a472a; }
    td { border: 1px solid #ddd; padding: 8px; }
    tr:nth-child(even) { background: #f9f9f9; }
    .number { text-align: right; font-family: 'Courier New', monospace; }
    .total { background: #e8f5e8 !important; font-weight: bold; }
    .footer { position: fixed; bottom: 20px; left: 20px; right: 20px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
    .summary { margin-top: 20px; padding: 15px; background: #f0f8f0; border-radius: 5px; }
    .summary h3 { color: #1a472a; margin-top: 0; }
    @media print {
      .footer { position: fixed; bottom: 0; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <p>Rapport généré par BMS - Business Management System</p>
    <p>${new Date().toLocaleString('fr-FR')}</p>
  </div>
  
  <div class="metadata">
    <p><strong>Date:</strong> ${data.metadata?.date || new Date().toLocaleDateString('fr-FR')}</p>
    ${data.metadata?.company ? `<p><strong>Entreprise:</strong> ${data.metadata.company}</p>` : ''}
    ${data.metadata?.period ? `<p><strong>Période:</strong> ${data.metadata.period}</p>` : ''}
    ${data.metadata?.author ? `<p><strong>Généré par:</strong> ${data.metadata.author}</p>` : ''}
  </div>
  
  <table>
    <thead>
      <tr>
        ${data.headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.rows.map(row => {
        if (Array.isArray(row)) {
          return `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        } else {
          return `<tr>${data.headers.map(header => `<td class="${typeof row[header] === 'number' ? 'number' : ''}">${row[header] || ''}</td>`).join('')}</tr>`;
        }
      }).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Page 1 sur 1 - Document confidentiel - BMS Business Management System</p>
  </div>
</body>
</html>`;

    // Téléchargement
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || data.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Export JSON structuré
   */
  static exportJSON(data: ExportData, filename?: string) {
    const jsonData = {
      title: data.title,
      metadata: data.metadata || {
        date: new Date().toISOString(),
        generated: 'BMS Business Management System'
      },
      headers: data.headers,
      data: data.rows,
      statistics: {
        totalRows: data.rows.length,
        exportDate: new Date().toISOString(),
        format: 'JSON'
      }
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || data.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

/**
 * Templates d'export prédéfinis
 */
export class ExportTemplates {
  static templateImportSocietes(data: any[]) {
    return ProfessionalExporter.exportExcel({
      title: 'Rapport d\'Import de Sociétés',
      headers: ['Nom', 'Email', 'Téléphone', 'Ville', 'Date d\'import', 'Statut'],
      rows: data.map(company => [
        company.name || 'Société Alpha SARL',
        company.email || 'contact@societe.bj',
        company.phone || '+229 XX XX XX XX',
        company.city || 'Cotonou',
        new Date().toLocaleDateString('fr-FR'),
        'Actif'
      ]),
      metadata: {
        date: new Date().toLocaleDateString('fr-FR'),
        company: 'BMS Business Management System',
        period: new Date().toISOString().split('T')[0]
      }
    }, 'import-societes');
  }

  static templateMRP(data: any) {
    return ProfessionalExporter.exportExcel({
      title: 'Rapport de Calcul des Besoins MRP',
      headers: ['Matériau', 'Quantité requise', 'Unité', 'Coût unitaire', 'Coût total', 'Date livraison'],
      rows: [
        ['Acier laminé', '500', 'tonnes', '250,000', '125,000,000', data.deliveryDate],
        ['Composants électroniques', '2,000', 'unités', '25,000', '50,000,000', data.deliveryDate],
        ['Peinture industrielle', '1,500', 'litres', '5,000', '7,500,000', data.deliveryDate],
        ['Emballages', '10,000', 'unités', '500', '5,000,000', data.deliveryDate],
        ['', '', '', 'Total', data.totalCost.toLocaleString('fr-FR'), '']
      ],
      metadata: {
        date: data.calculationDate,
        company: 'BMS Business Management System',
        period: `Livraison prévue: ${data.deliveryDate}`
      }
    }, 'mrp-besoins');
  }

  static templatePrevisionsVentes(data: any) {
    return ProfessionalExporter.exportExcel({
      title: 'Rapport de Prévisions des Ventes',
      headers: ['Mois', 'Revenus prévisionnels', 'Taux conversion', 'Objectif atteint'],
      rows: data.monthlyRevenue.map((revenue: number, index: number) => [
        `Mois ${index + 1}`,
        revenue.toLocaleString('fr-FR') + ' FCFA',
        data.conversionRate + '%',
        data.targetAchievement + '%'
      ]),
      metadata: {
        date: new Date().toLocaleDateString('fr-FR'),
        company: 'BMS Business Management System',
        period: '6 prochain mois'
      }
    }, 'previsions-ventes');
  }
}
