import { Injectable, OnModuleInit, OnModuleDestroy, Global } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // 1. Initialize the native pg driver pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. Instantiate the Prisma 7 driver adapter
    const adapter = new PrismaPg(pool);

    // 3. Pass the adapter to PrismaClient
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end(); // Clean up the pg driver pool
  }
}