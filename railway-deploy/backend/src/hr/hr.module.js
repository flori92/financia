const HRController = require('./hr.controller');
const HRService = require('./hr.service');
const { HREmployee, HRPayroll, HRLeave } = require('./hr.entity');

class HRModule {
  static getControllers() {
    return [HRController];
  }

  static getServices() {
    return [HRService];
  }

  static getEntities() {
    return [HREmployee, HRPayroll, HRLeave];
  }
}

module.exports = HRModule;
