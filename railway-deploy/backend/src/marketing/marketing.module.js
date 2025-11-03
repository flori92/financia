const { Module } = require('@nestjs/common');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { MarketingController } = require('./marketing.controller');
const { MarketingService } = require('./marketing.service');
const { MarketingCampaign, MarketingLead } = require('./marketing.entity');

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingCampaign, MarketingLead])
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService]
})
export class MarketingModule {}
