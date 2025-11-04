import { Injectable } from '@nestjs/common';

export interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  enabled: boolean;
}

@Injectable()
export class WorkflowEngineService {
  private rules: Map<string, WorkflowRule> = new Map();

  async createRule(rule: WorkflowRule): Promise<WorkflowRule> {
    this.rules.set(rule.id, rule);
    return rule;
  }

  async executeWorkflow(trigger: string, data: any): Promise<void> {
    const applicableRules = Array.from(this.rules.values()).filter(
      (rule) => rule.enabled && rule.trigger === trigger,
    );

    for (const rule of applicableRules) {
      if (this.evaluateConditions(rule.conditions, data)) {
        await this.executeActions(rule.actions, data);
      }
    }
  }

  private evaluateConditions(conditions: any[], data: any): boolean {
    if (!conditions || conditions.length === 0) return true;

    return conditions.every((condition) => {
      const { field, operator, value } = condition;
      const fieldValue = this.getNestedValue(data, field);

      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'not_equals':
          return fieldValue !== value;
        case 'greater_than':
          return fieldValue > value;
        case 'less_than':
          return fieldValue < value;
        case 'contains':
          return String(fieldValue).includes(value);
        case 'starts_with':
          return String(fieldValue).startsWith(value);
        default:
          return false;
      }
    });
  }

  private async executeActions(actions: any[], data: any): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'send_email':
          await this.sendEmail(action.params, data);
          break;
        case 'create_task':
          await this.createTask(action.params, data);
          break;
        case 'update_field':
          await this.updateField(action.params, data);
          break;
        case 'send_notification':
          await this.sendNotification(action.params, data);
          break;
        case 'webhook':
          await this.callWebhook(action.params, data);
          break;
      }
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private async sendEmail(params: any, data: any): Promise<void> {
    console.log('Sending email:', params, data);
    // Implement email sending
  }

  private async createTask(params: any, data: any): Promise<void> {
    console.log('Creating task:', params, data);
    // Implement task creation
  }

  private async updateField(params: any, data: any): Promise<void> {
    console.log('Updating field:', params, data);
    // Implement field update
  }

  private async sendNotification(params: any, data: any): Promise<void> {
    console.log('Sending notification:', params, data);
    // Implement notification
  }

  private async callWebhook(params: any, data: any): Promise<void> {
    console.log('Calling webhook:', params, data);
    // Implement webhook call
  }

  async getRules(): Promise<WorkflowRule[]> {
    return Array.from(this.rules.values());
  }

  async getRule(id: string): Promise<WorkflowRule | undefined> {
    return this.rules.get(id);
  }

  async updateRule(id: string, updates: Partial<WorkflowRule>): Promise<WorkflowRule> {
    const rule = this.rules.get(id);
    if (!rule) throw new Error('Rule not found');
    
    const updated = { ...rule, ...updates };
    this.rules.set(id, updated);
    return updated;
  }

  async deleteRule(id: string): Promise<void> {
    this.rules.delete(id);
  }
}
