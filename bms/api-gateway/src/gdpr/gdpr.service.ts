import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class GdprService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async exportUserData(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const data: any = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      },
      contacts: [],
      invoices: [],
      payments: [],
    };

    // Export contacts
    const contacts = await this.dataSource.query(
      'SELECT * FROM contacts WHERE company_id = $1',
      [user.companyId],
    );
    data.contacts = contacts;

    // Export invoices
    const invoices = await this.dataSource.query(
      'SELECT * FROM invoices WHERE company_id = $1',
      [user.companyId],
    );
    data.invoices = invoices;

    return data;
  }

  async deleteUserData(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // Anonymize user data
    user.email = `deleted_${user.id}@deleted.com`;
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.phone = null;
    user.isActive = false;

    await this.userRepository.save(user);
  }

  async getConsent(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return {
      userId: user.id,
      emailConsent: user.emailVerified,
      dataProcessingConsent: true,
    };
  }
}
