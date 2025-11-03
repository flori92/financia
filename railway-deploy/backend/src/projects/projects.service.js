const { Injectable } = require('@nestjs/common');
const { Repository } = require('typeorm');

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectTask)
    private tasksRepository: Repository<ProjectTask>,
  ) {}

  async getDashboardMetrics(companyId: string) {
    try {
      const mockData = {
        totalProjects: 12,
        activeProjects: 8,
        completedProjects: 4,
        totalBudget: 45000000,
        upcomingDeadlines: 3,
        teamMembers: 25,
        completionRate: 75.5,
        projectsByStatus: [
          { status: 'planning', count: 2 },
          { status: 'active', count: 8 },
          { status: 'completed', count: 4 },
          { status: 'on_hold', count: 1 }
        ],
        recentActivities: [
          { project: 'Site Web E-Commerce', activity: 'Milestone atteint', date: '2025-01-20' },
          { project: 'Application Mobile', activity: 'Nouvelle tâche assignée', date: '2025-01-19' },
          { project: 'Migration Cloud', activity: 'Statut mis à jour', date: '2025-01-18' }
        ]
      };

      return mockData;
    } catch (error) {
      throw new Error(`Erreur récupération KPIs projets: ${error.message}`);
    }
  }

  async getProjects(companyId: string, status?: string) {
    try {
      const mockProjects = [
        {
          id: "1",
          name: "Site Web E-Commerce",
          description: "Développement plateforme e-commerce complète",
          client: "SARL Tech Solutions",
          status: "active",
          priority: "high",
          startDate: "2024-12-01",
          endDate: "2025-02-15",
          budget: 15000000,
          progress: 85,
          projectManager: "Jean Dupont",
          teamSize: 6
        },
        {
          id: "2",
          name: "Application Mobile",
          description: "Application iOS/Android pour gestion stock",
          client: "EURL Commerce Plus",
          status: "active",
          priority: "medium",
          startDate: "2025-01-01",
          endDate: "2025-03-30",
          budget: 12000000,
          progress: 60,
          projectManager: "Marie Claire",
          teamSize: 4
        },
        {
          id: "3",
          name: "Migration Cloud",
          description: "Migration infrastructure vers AWS",
          client: "SA Industries Modernes",
          status: "active",
          priority: "high",
          startDate: "2024-11-15",
          endDate: "2025-02-10",
          budget: 18000000,
          progress: 40,
          projectManager: "Paul Martin",
          teamSize: 8
        }
      ];

      if (status) {
        return mockProjects.filter(project => project.status === status);
      }

      return mockProjects;
    } catch (error) {
      throw new Error(`Erreur récupération projets: ${error.message}`);
    }
  }

  async createProject(createProjectDto: any, companyId: string) {
    try {
      const project = {
        id: Date.now().toString(),
        ...createProjectDto,
        companyId,
        status: 'planning',
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return project;
    } catch (error) {
      throw new Error(`Erreur création projet: ${error.message}`);
    }
  }

  async updateProject(id: string, updateProjectDto: any) {
    try {
      const project = {
        id,
        ...updateProjectDto,
        updatedAt: new Date().toISOString()
      };

      return project;
    } catch (error) {
      throw new Error(`Erreur mise à jour projet: ${error.message}`);
    }
  }

  async getProjectTasks(projectId: string) {
    try {
      const mockTasks = [
        {
          id: "1",
          projectId,
          title: "Design interface utilisateur",
          description: "Créer maquettes Figma",
          assigneeId: "user1",
          assigneeName: "Alice Design",
          status: "completed",
          priority: "high",
          dueDate: "2025-01-15",
          estimatedHours: 40,
          actualHours: 35
        },
        {
          id: "2",
          projectId,
          title: "Développement backend API",
          description: "Implémenter endpoints REST",
          assigneeId: "user2",
          assigneeName: "Bob Dev",
          status: "in_progress",
          priority: "high",
          dueDate: "2025-02-01",
          estimatedHours: 80,
          actualHours: 45
        },
        {
          id: "3",
          projectId,
          title: "Tests intégration",
          description: "Tests E2E et performance",
          assigneeId: "user3",
          assigneeName: "Charlie QA",
          status: "pending",
          priority: "medium",
          dueDate: "2025-02-10",
          estimatedHours: 60,
          actualHours: 0
        }
      ];

      return mockTasks;
    } catch (error) {
      throw new Error(`Erreur récupération tâches: ${error.message}`);
    }
  }

  async createProjectTask(projectId: string, createTaskDto: any) {
    try {
      const task = {
        id: Date.now().toString(),
        projectId,
        ...createTaskDto,
        status: 'pending',
        actualHours: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return task;
    } catch (error) {
      throw new Error(`Erreur création tâche: ${error.message}`);
    }
  }
}
