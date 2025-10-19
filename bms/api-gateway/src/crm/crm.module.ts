import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { OpportunityController } from './opportunity.controller';
import { OpportunityService } from './opportunity.service';
import { Contact } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { Activity } from './entities/activity.entity';
import { Opportunity } from './entities/opportunity.entity';
import { PipelineStage } from './entities/pipeline-stage.entity';
import { ContactImport } from './entities/contact-import.entity';
import { CrmImportService } from './crm-import.service';

/**
 * Module CRM pour la gestion des contacts, opportunités et activités
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Contact,
      Tag,
      Activity,
      Opportunity,
      PipelineStage,
      ContactImport,
    ]),
  ],
  controllers: [CrmController, OpportunityController],
  providers: [CrmService, OpportunityService, CrmImportService],
  exports: [CrmService, OpportunityService, CrmImportService],
})
export class CrmModule {}
