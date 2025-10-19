import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Activity, ActivityType, ActivityStatus } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
  ) {}

  async create(dto: CreateActivityDto, companyId: string): Promise<Activity> {
    const activity = this.activityRepo.create({
      ...dto,
      companyId,
    });
    return this.activityRepo.save(activity);
  }

  async findAll(companyId: string, filters?: {
    contactId?: string;
    type?: ActivityType;
    status?: ActivityStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Activity[]> {
    const query = this.activityRepo.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .where('activity.companyId = :companyId', { companyId });
    
    if (filters?.contactId) {
      query.andWhere('activity.contactId = :contactId', { contactId: filters.contactId });
    }
    if (filters?.type) {
      query.andWhere('activity.type = :type', { type: filters.type });
    }
    if (filters?.status) {
      query.andWhere('activity.status = :status', { status: filters.status });
    }
    if (filters?.startDate && filters?.endDate) {
      query.andWhere('activity.dueDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    query.orderBy('activity.dueDate', 'ASC');

    return query.getMany();
  }

  async findOne(id: string, companyId: string): Promise<Activity> {
    const activity = await this.activityRepo.findOne({
      where: { id, companyId },
      relations: ['contact'],
    });
    if (!activity) throw new NotFoundException('Activité non trouvée');
    return activity;
  }

  async update(id: string, dto: UpdateActivityDto, companyId: string): Promise<Activity> {
    const activity = await this.findOne(id, companyId);
    Object.assign(activity, dto);
    return this.activityRepo.save(activity);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const activity = await this.findOne(id, companyId);
    await this.activityRepo.remove(activity);
  }

  async complete(id: string, companyId: string): Promise<Activity> {
    const activity = await this.findOne(id, companyId);
    activity.status = ActivityStatus.COMPLETED;
    return this.activityRepo.save(activity);
  }

  async getUpcoming(companyId: string, days: number = 7): Promise<Activity[]> {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return this.activityRepo.find({
      where: {
        companyId,
        status: ActivityStatus.PLANNED,
        dueDate: Between(now, future),
      },
      relations: ['contact'],
      order: { dueDate: 'ASC' },
    });
  }

  async getOverdue(companyId: string): Promise<Activity[]> {
    const now = new Date();
    const activities = await this.activityRepo
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.contact', 'contact')
      .where('activity.companyId = :companyId', { companyId })
      .andWhere('activity.status = :status', { status: ActivityStatus.PLANNED })
      .andWhere('activity.dueDate < :now', { now })
      .orderBy('activity.dueDate', 'ASC')
      .getMany();
    return activities;
  }
}
