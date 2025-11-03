const SalesController = require('./sales.controller');
const SalesService = require('./sales.service');
const { SalesQuote, SalesOrder, SalesClient } = require('./sales.entity');

class SalesModule {
  static getControllers() {
    return [SalesController];
  }

  static getServices() {
    return [SalesService];
  }

  static getEntities() {
    return [SalesQuote, SalesOrder, SalesClient];
  }
}

module.exports = SalesModule;
