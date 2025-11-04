import { Injectable } from '@nestjs/common';

interface WorkflowRule {
  id: string;
  name: string;
  trigger: 'invoice_created' | 'payment_received' | 'contact_created' | 'opportunity_won';
  conditions: Array<{ field: string; operator: string; value: any }>;
  actions: Array<{ type: 'email' | 'notification' | 'update_field' | 'create_task'; params: any }>;
  isActive: boolean;
}

@Injectable()
export class WorkflowAutomationService {
  private rules: WorkflowRule[] = [];

  async createRule(data: any) {
    const rule: WorkflowRule = {
      id: `WF-${Date.now()}`,
      isActive: true,
      ...data,
    };
    this.rules.push(rule);
    return rule;
  }

  async executeWorkflows(trigger: string, data: any) {
    const matchingRules = this.rules.filter(r => r.isActive && r.trigger === trigger);
    
    for (const rule of matchingRules) {
      if (this.evaluateConditions(rule.conditions, data)) {
        await this.executeActions(rule.actions, data);
      }
    }
  }

  private evaluateConditions(conditions: any[], data: any): boolean {
    return conditions.every(cond => {
      const value = data[cond.field];
      if (cond.operator === 'equals') return value === cond.value;
      if (cond.operator === 'greater_than') return value > cond.value;
      if (cond.operator === 'contains') return String(value).includes(cond.value);
      return false;
    });
  }

  private async executeActions(actions: any[], data: any) {
    for (const action of actions) {
      if (action.type === 'email') {
        console.log(`Envoi email: ${action.params.to} - ${action.params.subject}`);
      } else if (action.type === 'notification') {
        console.log(`Notification: ${action.params.message}`);
      }
    }
  }

  async findAll() {
    return this.rules;
  }
}
