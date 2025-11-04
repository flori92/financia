"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  Users, 
  TrendingUp, 
  Brain, 
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  UserPlus,
  Award,
  Clock,
  Activity
} from "lucide-react";

interface TurnoverPrediction {
  department: string;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number;
  keyFactors: string[];
  recommendations: string[];
  timeline: string;
}

interface TalentOptimization {
  project: string;
  currentAllocation: {
    employee: string;
    skills: string[];
    performance: number;
  }[];
  optimizedAllocation: {
    employee: string;
    role: string;
    efficiency: number;
  }[];
  expectedImprovement: number;
  aiReasoning: string;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  urgency: 'high' | 'medium' | 'low';
  trainingRecommendations: string[];
  hiringNeeds: number;
}

function HRManagerDashboard() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [turnoverPredictions, setTurnoverPredictions] = useState<TurnoverPrediction[]>([]);
  const [talentOptimizations, setTalentOptimizations] = useState<TalentOptimization[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);

  useEffect(() => {
    if (companyId) {
      loadHRData();
    }
  }, [companyId]);

  const loadHRData = async () => {
    setLoading(true);
    try {
      // Simulation des données ML/IA pour RH
      const turnoverData: TurnoverPrediction[] = [
        {
          department: "Commercial",
          riskLevel: "high",
          probability: 35,
          keyFactors: [
            "Charge de travail élevée (>50h/semaine)",
            "Rémunération sous le marché",
            "Manque d'opportunités de carrière"
          ],
          recommendations: [
            "Revoir la politique de rémunération",
            "Mettre en place des plans de carrière",
            "Réduire la charge de travail par l'automatisation"
          ],
          timeline: "3-6 mois"
        },
        {
          department: "Technique",
          riskLevel: "medium",
          probability: 22,
          keyFactors: [
            "Projets stimulants mais pression élevée",
            "Bon environnement de travail",
            "Compétitivité salariale moyenne"
          ],
          recommendations: [
            "Programmes de reconnaissance",
            "Formation continue avancée",
            "Équilibre vie pro/perso amélioré"
          ],
          timeline: "6-12 mois"
        }
      ];

      const optimizationData: TalentOptimization[] = [
        {
          project: "Lancement Platforme SaaS",
          currentAllocation: [
            { employee: "Alice T.", skills: ["Frontend", "React"], performance: 85 },
            { employee: "Bob M.", skills: ["Backend", "Node.js"], performance: 78 },
            { employee: "Carol L.", skills: ["DevOps", "AWS"], performance: 92 }
          ],
          optimizedAllocation: [
            { employee: "Alice T.", role: "Lead Frontend", efficiency: 95 },
            { employee: "Bob M.", role: "Full-stack Specialist", efficiency: 88 },
            { employee: "Carol L.", role: "DevOps Architect", efficiency: 96 }
          ],
          expectedImprovement: 23,
          aiReasoning: "Réallocation basée sur les forces individuelles et complémentarité des compétences pour optimiser la vélocité de 23%"
        }
      ];

      const skillGapData: SkillGap[] = [
        {
          skill: "Machine Learning",
          currentLevel: 35,
          requiredLevel: 75,
          gap: 40,
          urgency: "high",
          trainingRecommendations: [
            "Formation certifiante ML Engineer",
            "Projets internes d'application ML",
            "Mentorat par experts externes"
          ],
          hiringNeeds: 3
        },
        {
          skill: "Cloud Architecture",
          currentLevel: 55,
          requiredLevel: 80,
          gap: 25,
          urgency: "medium",
          trainingRecommendations: [
            "Certification AWS/Azure",
            "Workshops avancés",
            "Architecture reviews"
          ],
          hiringNeeds: 2
        }
      ];

      setTurnoverPredictions(turnoverData);
      setTalentOptimizations(optimizationData);
      setSkillGaps(skillGapData);
    } catch (error) {
      console.error('Erreur chargement données RH:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchTurnoverAnalysis = async () => {
    console.log('Lancement analyse turnover par ML...');
  };

  const handleOptimizeWorkforce = async () => {
    console.log('Optimisation allocation talent par IA...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord RH...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Ressources Humaines
          </h1>
          <p className="text-gray-600 mt-2">
            Management RH avancé avec analytics prédictifs et IA
          </p>
        </div>

        {/* KPI RH */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risque Turnover</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(turnoverPredictions.reduce((sum, t) => sum + t.probability, 0) / turnoverPredictions.length)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {turnoverPredictions.filter(t => t.riskLevel === 'high').length} départements à risque
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimisation Talent</p>
                <p className="text-2xl font-bold text-green-600">
                  {talentOptimizations.reduce((sum, t) => sum + t.expectedImprovement, 0)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Gain d'efficacité potentiel
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Besoins Formation</p>
                <p className="text-2xl font-bold text-blue-600">{skillGaps.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Compétences critiques identifiées
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hiring Prioritaires</p>
                <p className="text-2xl font-bold text-purple-600">
                  {skillGaps.reduce((sum, s) => sum + s.hiringNeeds, 0)}
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recrutements recommandés
            </p>
          </div>
        </div>

        {/* Actions RH */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={handleLaunchTurnoverAnalysis}
            className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Activity className="w-5 h-5" />
            <span>Analyse Turnover ML</span>
          </button>
          
          <button
            onClick={handleOptimizeWorkforce}
            className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Optimisation Workforce</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Target className="w-5 h-5" />
            <span>Plan Succession IA</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Award className="w-5 h-5" />
            <span>Performance Analytics</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prédictions de Turnover */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Prédictions Turnover par IA
            </h2>
            <div className="space-y-4">
              {turnoverPredictions.map((prediction, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{prediction.department}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          prediction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                          prediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Risque: {prediction.riskLevel}
                        </span>
                        <span className="text-sm text-gray-600">
                          Timeline: {prediction.timeline}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-red-600">{prediction.probability}%</p>
                      <p className="text-sm text-gray-600">probabilité</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Score de risque</span>
                      <span className="text-sm font-medium">{prediction.probability}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          prediction.probability > 30 ? 'bg-red-500' :
                          prediction.probability > 15 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${prediction.probability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">⚠️ Facteurs de risque:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {prediction.keyFactors.map((factor, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-green-700 mb-1">✅ Recommandations:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {prediction.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optimisation du Talent */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Optimisation Talent par ML
            </h2>
            <div className="space-y-4">
              {talentOptimizations.map((optimization, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{optimization.project}</h3>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">+{optimization.expectedImprovement}%</p>
                      <p className="text-sm text-gray-600">efficacité</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Allocation Actuelle:</p>
                    <div className="space-y-1">
                      {optimization.currentAllocation.map((alloc, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{alloc.employee}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{alloc.skills.join(", ")}</span>
                            <span className="font-medium">{alloc.performance}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Allocation Optimisée IA:</p>
                    <div className="space-y-1">
                      {optimization.optimizedAllocation.map((alloc, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{alloc.employee}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">{alloc.role}</span>
                            <span className="font-medium text-green-600">{alloc.efficiency}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">🤖 Raisonnement IA:</p>
                    <p className="text-sm text-blue-800">{optimization.aiReasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analyse des Compétences */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Analyse des Écarts de Compétences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillGaps.map((gap, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{gap.skill}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      gap.urgency === 'high' ? 'bg-red-100 text-red-800' :
                      gap.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {gap.urgency === 'high' ? 'Urgent' :
                       gap.urgency === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                    <span className="text-sm text-gray-600">
                      +{gap.hiringNeeds} hiring
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Niveau actuel vs requis</span>
                    <span className="text-sm font-medium">{gap.currentLevel} → {gap.requiredLevel}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-16">Actuel:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${gap.currentLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gap.currentLevel}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-16">Cible:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${gap.requiredLevel}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{gap.requiredLevel}%</span>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-sm text-red-600 font-medium">Écart: {gap.gap}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">📚 Formations recommandées:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {gap.trainingRecommendations.map((training, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{training}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HRManagerPage() {
  return (
    <ProtectedPage requiredRole="ROLE_HR_MANAGER">
      <HRManagerDashboard />
    </ProtectedPage>
  );
}
