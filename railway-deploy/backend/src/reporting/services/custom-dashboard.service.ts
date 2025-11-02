import { Injectable } from '@nestjs/common';

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'gauge';
  title: string;
  dataSource: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
}

interface Dashboard {
  id: string;
  companyId: string;
  userId: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
}

@Injectable()
export class CustomDashboardService {
  private dashboards: Dashboard[] = [];

  async create(data: any) {
    const dashboard: Dashboard = {
      id: `DASH-${Date.now()}`,
      widgets: [],
      isDefault: false,
      ...data,
    };
    this.dashboards.push(dashboard);
    return dashboard;
  }

  async addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>) {
    const dashboard = this.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) throw new Error('Dashboard introuvable');

    const newWidget: DashboardWidget = {
      id: `WDG-${Date.now()}`,
      ...widget,
    };
    dashboard.widgets.push(newWidget);
    return dashboard;
  }

  async getData(dashboardId: string) {
    const dashboard = this.dashboards.find(d => d.id === dashboardId);
    if (!dashboard) throw new Error('Dashboard introuvable');

    const widgetsWithData = await Promise.all(
      dashboard.widgets.map(async widget => ({
        ...widget,
        data: await this.fetchWidgetData(widget),
      }))
    );

    return { ...dashboard, widgets: widgetsWithData };
  }

  private async fetchWidgetData(widget: DashboardWidget) {
    // Simulation récupération données
    if (widget.type === 'kpi') return { value: 125000, trend: 15 };
    if (widget.type === 'chart') return { labels: ['Jan', 'Fev', 'Mar'], values: [100, 150, 200] };
    return {};
  }

  async findByUser(userId: string, companyId: string) {
    return this.dashboards.filter(d => d.userId === userId && d.companyId === companyId);
  }
}
