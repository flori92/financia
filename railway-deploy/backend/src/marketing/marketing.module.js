const MarketingController = require('./marketing.controller');
const MarketingService = require('./marketing.service');
const { MarketingCampaign, MarketingLead } = require('./marketing.entity');

class MarketingModule {
  static getControllers() {
    return [MarketingController];
  }

  static getServices() {
    return [MarketingService];
  }

  static getEntities() {
    return [MarketingCampaign, MarketingLead];
  }
}

module.exports = MarketingModule;
