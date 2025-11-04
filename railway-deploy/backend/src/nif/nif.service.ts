import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NifRequest } from './entities/nif-request.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class NifService {
  constructor(
    @InjectRepository(NifRequest)
    private nifRequestRepository: Repository<NifRequest>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async createRequest(userId: string, data: any) {
    // Vérifier si l'entreprise n'a pas déjà un NIF
    const company = await this.companyRepository.findOne({
      where: { id: data.companyId },
    });

    if (!company) {
      throw new NotFoundException('Entreprise non trouvée');
    }

    if (company.nifNumber) {
      throw new BadRequestException('Cette entreprise possède déjà un NIF');
    }

    // Créer la demande
    const request = this.nifRequestRepository.create({
      userId,
      companyId: data.companyId,
      businessName: data.businessName,
      businessType: data.businessType,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      documents: data.documents,
      status: 'pending',
    });

    return this.nifRequestRepository.save(request);
  }

  async updateDocument(id: string, userId: string, key: string, url: string) {
    const request = await this.getRequest(id, userId);
    if (!request) throw new NotFoundException('Demande NIF non trouvée');
    const docs = request.documents || {} as any;
    if (!url) {
      delete (docs as any)[key];
    } else {
      (docs as any)[key] = url;
    }
    request.documents = docs as any;
    return this.nifRequestRepository.save(request);
  }

  async getRequest(id: string, userId: string) {
    const request = await this.nifRequestRepository.findOne({
      where: { id, userId },
      relations: ['company'],
    });

    if (!request) {
      throw new NotFoundException('Demande NIF non trouvée');
    }

    return request;
  }

  async getUserRequests(userId: string) {
    return this.nifRequestRepository.find({
      where: { userId },
      relations: ['company'],
      order: { createdAt: 'DESC' },
    });
  }

  async submitRequest(id: string, userId: string) {
    const request = await this.getRequest(id, userId);

    if (request.status !== 'pending') {
      throw new BadRequestException('Cette demande a déjà été soumise');
    }

    // Vérifier que tous les documents sont fournis
    if (!request.documents.identityCard || !request.documents.proofOfAddress) {
      throw new BadRequestException('Documents incomplets');
    }

    request.status = 'under_review';
    request.submittedAt = new Date();

    // TODO: Appeler l'API DGI Bénin pour soumettre la demande
    // const dgiResponse = await this.callDGIApi(request);
    // request.dgiReference = dgiResponse.reference;

    return this.nifRequestRepository.save(request);
  }

  // Admin/Tax Admin: Approuver demande NIF
  async approveRequest(id: string, adminId: string, nifNumber: string) {
    const request = await this.nifRequestRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!request) {
      throw new NotFoundException('Demande NIF non trouvée');
    }

    // Générer le NIF si non fourni
    if (!nifNumber) {
      nifNumber = await this.generateNIF();
    }

    // Mettre à jour la demande
    request.status = 'approved';
    request.nifNumber = nifNumber;
    request.reviewedBy = adminId;
    request.approvedAt = new Date();

    await this.nifRequestRepository.save(request);

    // Mettre à jour l'entreprise avec le NIF
    await this.companyRepository.update(request.companyId, {
      nifNumber: nifNumber,
    });

    return request;
  }

  async rejectRequest(id: string, adminId: string, reason: string) {
    const request = await this.nifRequestRepository.findOne({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Demande NIF non trouvée');
    }

    request.status = 'rejected';
    request.rejectionReason = reason;
    request.reviewedBy = adminId;

    return this.nifRequestRepository.save(request);
  }

  async verifyNIF(nifNumber: string) {
    const request = await this.nifRequestRepository.findOne({
      where: { nifNumber },
      relations: ['company', 'user'],
    });

    if (!request) {
      return { valid: false, message: 'NIF non trouvé' };
    }

    if (request.status !== 'approved') {
      return { valid: false, message: 'NIF non validé' };
    }

    return {
      valid: true,
      company: {
        name: request.businessName,
        type: request.businessType,
        nif: nifNumber,
      },
    };
  }

  // Admin: Lister toutes les demandes
  async getAllRequests(filters?: any) {
    const query = this.nifRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.company', 'company')
      .leftJoinAndSelect('request.user', 'user');

    if (filters?.status) {
      query.where('request.status = :status', { status: filters.status });
    }

    if (filters?.businessType) {
      query.andWhere('request.business_type = :type', { type: filters.businessType });
    }

    return query.orderBy('request.created_at', 'DESC').getMany();
  }

  private async generateNIF(): Promise<string> {
    // Format: BJ + 10 chiffres
    const prefix = 'BJ';
    const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const nif = `${prefix}${random}`;

    // Vérifier unicité
    const existing = await this.nifRequestRepository.findOne({
      where: { nifNumber: nif },
    });

    if (existing) {
      return this.generateNIF(); // Régénérer si existe
    }

    return nif;
  }

  private async callDGIApi(request: NifRequest) {
    // TODO: Implémenter l'appel réel à l'API DGI Bénin
    // Pour l'instant, simulation
    return {
      reference: `DGI-${Date.now()}`,
      status: 'pending',
    };
  }
}
