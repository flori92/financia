import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from '../entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async findAll(companyId: string) {
    // Si companyId vide, retourner tableau vide pour éviter erreur 404
    if (!companyId) return [];
    return this.assetRepo.find({ where: { companyId } });
  }

  async create(createAssetDto: any) {
    const asset = this.assetRepo.create(createAssetDto);
    return this.assetRepo.save(asset);
  }

  async findOne(id: string, companyId: string) {
    if (!companyId) return null;
    return this.assetRepo.findOne({ where: { id, companyId } });
  }

  async update(id: string, companyId: string, updateAssetDto: any) {
    const asset = await this.findOne(id, companyId);
    if (!asset) throw new Error('Asset not found');
    Object.assign(asset, updateAssetDto);
    return this.assetRepo.save(asset);
  }

  async remove(id: string, companyId: string) {
    const asset = await this.findOne(id, companyId);
    if (!asset) throw new Error('Asset not found');
    return this.assetRepo.remove(asset);
  }
}
