"use client";

import { useState, useEffect } from "react";
import { useCompanyId } from '@/hooks/useCompanyId';
import { ProtectedPage } from '@/components/auth/ProtectedPage';
import { 
  User, 
  Calendar, 
  Award, 
  BookOpen,
  Target,
  Heart,
  Clock,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Coffee
} from "lucide-react";

interface PersonalObjective {
  id: string;
  title: string;
  progress: number;
  target: number;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'completed';
  aiRecommendation: string;
}

interface TrainingSuggestion {
  id: string;
  title: string;
  category: string;
  duration: string;
  relevance: number;
  skills: string[];
  careerImpact: string;
}

interface WellnessMetric {
  category: string;
  score: number;
  trend: 'improving' | 'stable' | 'declining';
  insight: string;
  recommendation: string;
}

function EmployeeDashboard() {
  const companyId = useCompanyId();
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState<PersonalObjective[]>([]);
  const [trainings, setTrainings] = useState<TrainingSuggestion[]>([]);
  const [wellness, setWellness] = useState<WellnessMetric[]>([]);

  useEffect(() => {
    if (companyId) {
      loadEmployeeData();
    }
  }, [companyId]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      // Simulation des données ML/IA pour employé
      const objectiveData: PersonalObjective[] = [
        {
          id: "OBJ-001",
          title: "Maîtriser les techniques de vente avancées",
          progress: 75,
          target: 100,
          deadline: "2025-12-31",
          status: "on_track",
          aiRecommendation: "Focus sur la négociation client et la gestion des objections pour atteindre l'objectif"
        },
        {
          id: "OBJ-002", 
          title: "Certification en analyse de données",
          progress: 45,
          target: 100,
          deadline: "2026-03-31",
          status: "at_risk",
          aiRecommendation: "Consacrer 8h/semaine à la formation et identifier un mentor pour accélérer l'apprentissage"
        }
      ];

      const trainingData: TrainingSuggestion[] = [
        {
          id: "TRAIN-001",
          title: "Leadership et Management d'Équipe",
          category: "Développement Carrière",
          duration: "6 semaines",
          relevance: 92,
          skills: ["Management", "Communication", "Stratégie"],
          careerImpact: "Ouverture vers des postes de management avec +25% de rémunération potentielle"
        },
        {
          id: "TRAIN-002",
          title: "Analyse Prédictive avec Python",
          category: "Compétences Techniques",
          duration: "8 semaines", 
          relevance: 88,
          skills: ["Python", "Machine Learning", "Data Analysis"],
          careerImpact: "Positionnement sur les métiers de la data avec forte demande du marché"
        }
      ];

      const wellnessData: WellnessMetric[] = [
        {
          category: "Équilibre Vie Pro/Perso",
          score: 78,
          trend: "improving",
          insight: "Bon équilibre global avec des pics de charge bien gérés",
          recommendation: "Maintenir les routines actuelles et ajouter des pauses régulières"
        },
        {
          category: "Stress et Charge de Travail",
          score: 65,
          trend: "stable",
          insight: "Niveau de stress modéré avec pics prévisibles en fin de mois",
          recommendation: "Pratiquer la méditation 10min/jour et planifier les tâches à l'avance"
        },
        {
          category: "Épanouissement Professionnel",
          score: 82,
          trend: "improving",
          insight: "Forte progression dans les compétences et la reconnaissance",
          recommendation: "Continuer sur la voie actuelle et explorer les opportunités de mentorat"
        }
      ];

      setObjectives(objectiveData);
      setTrainings(trainingData);
      setWellness(wellnessData);
    } catch (error) {
      console.error('Erreur chargement données employé:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTraining = async (trainingId: string) => {
    console.log('Demande de formation:', trainingId);
  };

  const handleUpdateObjective = async (objectiveId: string) => {
    console.log('Mise à jour objectif:', objectiveId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace personnel...</p>
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
            <User className="w-8 h-8 text-blue-600" />
            Espace Employé
          </h1>
          <p className="text-gray-600 mt-2">
            Votre espace personnel avec accompagnement IA pour votre développement
          </p>
        </div>

        {/* KPI Personnels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Objectifs en Cours</p>
                <p className="text-2xl font-bold text-green-600">{objectives.length}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {objectives.filter(o => o.status === 'on_track').length} sur la bonne voie
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Formations IA</p>
                <p className="text-2xl font-bold text-blue-600">{trainings.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Recommandations personnalisées
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bien-être</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(wellness.reduce((sum, w) => sum + w.score, 0) / wellness.length)}%
                </p>
              </div>
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Score global de bien-être
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-2xl font-bold text-amber-600">
                  {Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Moyenne des objectifs
            </p>
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Calendar className="w-5 h-5" />
            <span>Demande Congé</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Award className="w-5 h-5" />
            <span>Évaluation Performance</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span>Feedback IA</span>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Coffee className="w-5 h-5" />
            <span>Pause Bien-être</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Objectifs Personnels */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Objectifs Personnels avec Coaching IA
            </h2>
            <div className="space-y-4">
              {objectives.map((objective, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{objective.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          objective.status === 'on_track' ? 'bg-green-100 text-green-800' :
                          objective.status === 'at_risk' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {objective.status === 'on_track' ? 'Bien parti' :
                           objective.status === 'at_risk' ? 'À risque' : 'Terminé'}
                        </span>
                        <span className="text-sm text-gray-600">
                          Échéance: {new Date(objective.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">{objective.progress}%</p>
                      <p className="text-sm text-gray-600">Objectif: {objective.target}%</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          objective.status === 'on_track' ? 'bg-green-500' :
                          objective.status === 'at_risk' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${objective.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-blue-900 mb-1">💡 Conseil IA:</p>
                    <p className="text-sm text-blue-800">{objective.aiRecommendation}</p>
                  </div>

                  <button
                    onClick={() => handleUpdateObjective(objective.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mettre à jour la progression →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations de Formation */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Formations Recommandées
            </h2>
            <div className="space-y-4">
              {trainings.map((training, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {training.category}
                    </span>
                    <span className="text-sm text-gray-600">{training.duration}</span>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-2">{training.title}</h3>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Pertinence IA</span>
                      <span className="text-sm font-medium">{training.relevance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${training.relevance}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Compétences développées:</p>
                    <div className="flex flex-wrap gap-1">
                      {training.skills.map((skill, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 p-2 bg-green-50 rounded text-xs text-green-800">
                    <strong>Impact carrière:</strong> {training.careerImpact}
                  </div>

                  <button
                    onClick={() => handleRequestTraining(training.id)}
                    className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                  >
                    Demander cette formation
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métriques de Bien-être */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-purple-600" />
            Analyse de Bien-être par IA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {wellness.map((metric, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{metric.category}</h3>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {metric.trend === 'stable' && <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>}
                    {metric.trend === 'declining' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-sm font-medium">{metric.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.score > 75 ? 'bg-green-500' :
                        metric.score > 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Analyse IA: </span>
                    <span className="text-gray-800">{metric.insight}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Conseil: </span>
                    <span className="text-blue-600">{metric.recommendation}</span>
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

export default function EmployeePage() {
  return (
    <ProtectedPage requiredRole="ROLE_EMPLOYEE">
      <EmployeeDashboard />
    </ProtectedPage>
  );
}
