import { Injectable } from '@nestjs/common';

@Injectable()
export class KnowledgeBaseService {
  async createArticle(data: any): Promise<any> {
    return { id: this.generateId(), ...data, published: false, views: 0, helpful: 0 };
  }

  async publishArticle(articleId: string): Promise<any> {
    return { articleId, published: true, publishedAt: new Date() };
  }

  async searchArticles(query: string): Promise<any[]> {
    const articles = await this.getArticles();
    return articles.filter(a => a.title.includes(query) || a.content.includes(query));
  }

  async rateArticle(articleId: string, helpful: boolean): Promise<any> {
    return { articleId, helpful, ratedAt: new Date() };
  }

  private async getArticles(): Promise<any[]> {
    return [];
  }

  private generateId(): string {
    return `KB-${Date.now()}`;
  }
}
