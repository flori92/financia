import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { handlerReporter, HandlerReport } from '@/lib/utils/handlers-report';
import { CheckCircle, AlertCircle, XCircle, RefreshCw, Download, TrendingUp, TrendingDown } from 'lucide-react';

interface HandlersDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const HandlersDashboard: React.FC<HandlersDashboardProps> = ({
  autoRefresh = true,
  refreshInterval = 30000 // 30 secondes
}) => {
  const [reports, setReports] = useState<HandlerReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadReports = async () => {
    setLoading(true);
    try {
      const newReports = handlerReporter.validateAllPages();
      setReports(newReports);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur chargement des rapports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();

    if (autoRefresh) {
      const interval = setInterval(loadReports, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Calculate global report from cached reports instead of re-validating
  const globalReport = React.useMemo(() => {
    if (reports.length === 0) {
      return {
        totalPages: 0,
        totalHandlers: 0,
        totalImplemented: 0,
        averageCompletionRate: 0,
        averageQualityScore: 0,
        criticalIssues: [],
        pages: []
      };
    }

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
  }, [reports]);

  // Calculate recommendations from cached globalReport instead of re-validating
  const recommendations = React.useMemo(() => {
    const recs: string[] = [];

    if (globalReport.averageCompletionRate < 100) {
      recs.push(`🔧 Implémenter les ${globalReport.totalHandlers - globalReport.totalImplemented} handlers manquants`);
    }

    if (globalReport.averageQualityScore < 90) {
      recs.push('🛡️ Améliorer la gestion des erreurs dans les handlers existants');
    }

    const pagesWithIssues = reports
      .filter(report => report.completionRate < 100 || report.qualityScore < 90)
      .map(report => report.page);

    if (pagesWithIssues.length > 0) {
      recs.push(`📝 Prioriser les pages: ${pagesWithIssues.join(', ')}`);
    }

    const criticalIssues = globalReport.criticalIssues.length;
    if (criticalIssues > 0) {
      recs.push(`🚨 Résoudre les ${criticalIssues} problèmes critiques identifiés`);
    }

    if (recs.length === 0) {
      recs.push('🎉 Tous les handlers sont fonctionnels! Continuez comme ça!');
    }

    return recs;
  }, [globalReport, reports]);

  const getStatusIcon = (completionRate: number) => {
    if (completionRate === 100) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (completionRate >= 75) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusBadge = (completionRate: number) => {
    if (completionRate === 100) return <Badge className="bg-green-100 text-green-800">Complet</Badge>;
    if (completionRate >= 75) return <Badge className="bg-yellow-100 text-yellow-800">Partiel</Badge>;
    return <Badge className="bg-red-100 text-red-800">Critique</Badge>;
  };

  const exportReport = () => {
    const reportJson = handlerReporter.exportReport();
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handlers-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const refreshReports = () => {
    loadReports();
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard des Handlers</h1>
          <p className="text-sm text-gray-600">
            Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshReports}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pages analysées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalReport.totalPages}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Handlers totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalReport.totalHandlers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taux de complétion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{globalReport.averageCompletionRate}%</div>
              {globalReport.averageCompletionRate >= 75 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <Progress value={globalReport.averageCompletionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Score de qualité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{globalReport.averageQualityScore}%</div>
              {globalReport.averageQualityScore >= 90 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <Progress value={globalReport.averageQualityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alertes si problèmes critiques */}
      {globalReport.criticalIssues.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Problèmes critiques détectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-2">
              {globalReport.criticalIssues.length} handlers ne sont pas implémentés
            </p>
            <div className="space-y-1">
              {globalReport.criticalIssues.slice(0, 5).map((issue: any, index: number) => (
                <div key={index} className="text-sm text-red-600">
                  • {issue.page} - {issue.handlerName}
                </div>
              ))}
              {globalReport.criticalIssues.length > 5 && (
                <div className="text-sm text-red-600">
                  ... et {globalReport.criticalIssues.length - 5} autres
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau détaillé par page */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Page</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-center py-2 px-2">Handlers</th>
                  <th className="text-center py-2 px-2">Complétion</th>
                  <th className="text-center py-2 px-2">Qualité</th>
                  <th className="text-center py-2 px-2">Progrès</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium">{report.page}</td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getStatusIcon(report.completionRate)}
                        {getStatusBadge(report.completionRate)}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      {report.implementedHandlers}/{report.totalHandlers}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-medium ${
                        report.completionRate === 100 ? 'text-green-600' :
                        report.completionRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {report.completionRate}%
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-medium ${
                        report.qualityScore >= 90 ? 'text-green-600' :
                        report.qualityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {report.qualityScore}%
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <Progress value={report.completionRate} className="h-2" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HandlersDashboard;
