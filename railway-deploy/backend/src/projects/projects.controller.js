const projectsService = require('./projects.service');

class ProjectsController {
  constructor(projectsService) {
    this.projectsService = projectsService;
  }

  async getProjectsDashboard(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.projectsService.getDashboardMetrics(companyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProjects(req, res) {
    try {
      const { companyId, status } = req.query;
      const result = await this.projectsService.getProjects(companyId, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProject(req, res) {
    try {
      const { companyId } = req.query;
      const result = await this.projectsService.createProject(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const result = await this.projectsService.updateProject(id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProjectTasks(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;
      const result = await this.projectsService.getProjectTasks(id, status);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProjectTask(req, res) {
    try {
      const { id } = req.params;
      const result = await this.projectsService.createProjectTask(id, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProjectTask(req, res) {
    try {
      const { taskId } = req.params;
      const result = await this.projectsService.updateProjectTask(taskId, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProjectsController;
