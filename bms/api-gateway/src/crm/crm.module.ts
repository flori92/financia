import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { OpportunityController } from './opportunity.controller';
import { OpportunityService } from './opportunity.service';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { Contact } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { Activity } from './entities/activity.entity';
import { Opportunity } from './entities/opportunity.entity';
import { PipelineStage } from './entities/pipeline-stage.entity';
import { ContactImport } from './entities/contact-import.entity';
import { CrmImportService } from './crm-import.service';
import { LeadScoringService } from './lead-scoring.service';
import { FormalizationService } from './formalization.service';
import { EmailIntegrationService } from './email-integration.service';

/**
 * Module CRM complet pour BMS - Adapté au contexte béninois
 * - Contacts, Opportunités, Activités
 * - Scoring des leads
 * - Accompagnement à la formalisation (NIF, RCCM)
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
  controllers: [CrmController, OpportunityController, ActivityController],
  providers: [
    CrmService,
    OpportunityService,
    ActivityService,
    CrmImportService,
    LeadScoringService,
    FormalizationService,
    EmailIntegrationService,
  ],
  exports: [
    CrmService,
    OpportunityService,
    ActivityService,
    CrmImportService,
    LeadScoringService,
    FormalizationService,
    EmailIntegrationService,
  ],
})
export class CrmModule {}
