import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  FrappeAuthResponse,
  FrappeDocResponse,
  FrappeListResponse,
} from '../interfaces/frappe-response.interface';

/**
 * Service de communication avec l'API Frappe/ERPNext
 */
@Injectable()
export class FrappeApiService {
  private readonly logger = new Logger(FrappeApiService.name);
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private sessionId: string;
  private isAvailable = false;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'FRAPPE_BASE_URL',
      'http://localhost:8000',
    );
    this.apiKey = this.configService.get<string>('FRAPPE_API_KEY', '');
    this.apiSecret = this.configService.get<string>('FRAPPE_API_SECRET', '');

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor pour ajouter l'authentification
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.apiKey && this.apiSecret) {
        config.headers['Authorization'] = `token ${this.apiKey}:${this.apiSecret}`;
      } else if (this.sessionId) {
        config.headers['Cookie'] = `sid=${this.sessionId}`;
      }
      return config;
    });

    // Vérifier la disponibilité au démarrage
    this.checkAvailability();
  }

  /**
   * Vérifier si Frappe est disponible
   */
  async checkAvailability(): Promise<boolean> {
    try {
      await this.axiosInstance.get('/api/method/ping');
      this.isAvailable = true;
      this.logger.log(' Frappe is available');
      return true;
    } catch (error) {
      this.isAvailable = false;
      this.logger.warn(' Frappe is not available - BMS will work in standalone mode');
      return false;
    }
  }

  /**
   * Authentification avec login/password
   */
  async login(username: string, password: string): Promise<FrappeAuthResponse> {
    try {
      const response = await this.axiosInstance.post<FrappeAuthResponse>(
        '/api/method/login',
        {
          usr: username,
          pwd: password,
        },
      );

      this.sessionId = response.data.sid;
      this.isAvailable = true;

      return response.data;
    } catch (error) {
      this.logger.error('Frappe login failed', error);
      throw new HttpException(
        'Failed to authenticate with Frappe',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Récupérer un document
   */
  async getDoc<T = any>(
    doctype: string,
    name: string,
  ): Promise<T> {
    if (!this.isAvailable) {
      throw new HttpException(
        'Frappe is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await this.axiosInstance.get<FrappeDocResponse<T>>(
        `/api/resource/${doctype}/${name}`,
      );
      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get ${doctype}/${name}`, error);
      throw new HttpException(
        `Failed to fetch ${doctype}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Récupérer une liste de documents
   */
  async getList<T = any>(
    doctype: string,
    filters?: Record<string, any>,
    fields?: string[],
    limit?: number,
  ): Promise<T[]> {
    if (!this.isAvailable) {
      return [];
    }

    try {
      const params: any = {};
      if (filters) params.filters = JSON.stringify(filters);
      if (fields) params.fields = JSON.stringify(fields);
      if (limit) params.limit_page_length = limit;

      const response = await this.axiosInstance.get<FrappeListResponse<T>>(
        `/api/resource/${doctype}`,
        { params },
      );

      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to get list of ${doctype}`, error);
      return [];
    }
  }

  /**
   * Créer un document
   */
  async createDoc<T = any>(
    doctype: string,
    data: Partial<T>,
  ): Promise<T> {
    if (!this.isAvailable) {
      throw new HttpException(
        'Frappe is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await this.axiosInstance.post<FrappeDocResponse<T>>(
        `/api/resource/${doctype}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to create ${doctype}`, error);
      throw new HttpException(
        `Failed to create ${doctype}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Mettre à jour un document
   */
  async updateDoc<T = any>(
    doctype: string,
    name: string,
    data: Partial<T>,
  ): Promise<T> {
    if (!this.isAvailable) {
      throw new HttpException(
        'Frappe is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await this.axiosInstance.put<FrappeDocResponse<T>>(
        `/api/resource/${doctype}/${name}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      this.logger.error(`Failed to update ${doctype}/${name}`, error);
      throw new HttpException(
        `Failed to update ${doctype}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Supprimer un document
   */
  async deleteDoc(doctype: string, name: string): Promise<void> {
    if (!this.isAvailable) {
      throw new HttpException(
        'Frappe is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      await this.axiosInstance.delete(`/api/resource/${doctype}/${name}`);
    } catch (error) {
      this.logger.error(`Failed to delete ${doctype}/${name}`, error);
      throw new HttpException(
        `Failed to delete ${doctype}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Appeler une méthode Frappe
   */
  async callMethod<T = any>(
    method: string,
    args?: Record<string, any>,
  ): Promise<T> {
    if (!this.isAvailable) {
      throw new HttpException(
        'Frappe is not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await this.axiosInstance.post<{ message: T }>(
        `/api/method/${method}`,
        args,
      );
      return response.data.message;
    } catch (error) {
      this.logger.error(`Failed to call method ${method}`, error);
      throw new HttpException(
        `Failed to call ${method}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Getter pour vérifier la disponibilité
   */
  get available(): boolean {
    return this.isAvailable;
  }
}
