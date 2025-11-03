const ProjectsController = require('./projects.controller');
const ProjectsService = require('./projects.service');
const { Project, ProjectTask } = require('./projects.entity');

class ProjectsModule {
  static getControllers() {
    return [ProjectsController];
  }

  static getServices() {
    return [ProjectsService];
  }

  static getEntities() {
    return [Project, ProjectTask];
  }
}

module.exports = ProjectsModule;
