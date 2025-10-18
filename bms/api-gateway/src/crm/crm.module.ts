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
    ]),
  ],
  controllers: [CrmController, OpportunityController],
  providers: [CrmService, OpportunityService],
  exports: [CrmService, OpportunityService],
})
export class CrmModule {}
