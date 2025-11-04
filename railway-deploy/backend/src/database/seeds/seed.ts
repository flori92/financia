import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runDevSeed } from './dev.seed';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'bms',
  password: process.env.DATABASE_PASSWORD || 'bms_dev_password',
  database: process.env.DATABASE_NAME || 'bms',
  synchronize: false,
  logging: false,
});

async function main() {
  console.log('🚀 Connecting to database...');
  
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  try {
    await runDevSeed(AppDataSource);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
  }
}

main();
