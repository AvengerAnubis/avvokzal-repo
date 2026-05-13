import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Игнорировать ошибки самоподписанных сертификатов
      },
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    // Seed admin user if not exists
    await this.seedAdminUser();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async seedAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.log('Admin credentials not configured in .env');
      return;
    }

    try {
      const existingAdmin = await this.user.findUnique({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        console.log('Admin user already exists');
        return;
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Админ',
          lastName: 'Системы',
          role: 'ADMIN',
          isActive: true,
        },
      });
      console.log(`Admin user created: ${adminEmail}`);
    } catch (error) {
      console.error('Error seeding admin user:', error);
    }
  }
}
