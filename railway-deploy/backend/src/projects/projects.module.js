const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { ProjectsController } = require('./projects.controller');
const { ProjectsService } = require('./projects.service');
const { Project, ProjectTask } = require('./projects.entity');

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectTask])
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService]
})
export class ProjectsModule {}
