import { PrismaClient } from '@prisma/client';
import { MockDbService } from './mock-db.service';

async function main() {
  const prisma = new PrismaClient();
  const mockDb = new MockDbService();

  console.log('Seeding PostgreSQL database via Prisma...');

  try {
    // Clear existing tables
    await prisma.fraudInvestigation.deleteMany();
    await prisma.fraudAlert.deleteMany();
    await prisma.fraudRule.deleteMany();
    await prisma.ledgerEntry.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.paymentEvent.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.account.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.userRole.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();

    // 1. Seed Users
    for (const u of mockDb.users) {
      await prisma.user.create({
        data: {
          id: u.id,
          externalAuthId: u.externalAuthId,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          status: u.status,
          roles: {
            create: u.roles.map((r) => ({ role: r as any })),
          },
        },
      });
    }

    // 2. Seed Fraud Rules
    for (const r of mockDb.fraudRules) {
      await prisma.fraudRule.create({
        data: {
          id: r.id,
          ruleCode: r.ruleCode,
          name: r.name,
          description: r.description,
          criteria: r.criteria as any,
          scoreWeight: r.scoreWeight,
          isActive: r.isActive,
        },
      });
    }

    // 3. Seed Customers
    for (const c of mockDb.customers) {
      await prisma.customer.create({
        data: {
          id: c.id,
          customerNumber: c.customerNumber,
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone,
          country: c.country,
          kycStatus: c.kycStatus as any,
          riskLevel: c.riskLevel as any,
          riskScore: c.riskScore,
          status: c.status,
        },
      });
    }

    // 4. Seed Accounts
    for (const a of mockDb.accounts) {
      await prisma.account.create({
        data: {
          id: a.id,
          accountNumber: a.accountNumber,
          customerId: a.customerId,
          accountType: a.accountType as any,
          currency: a.currency as any,
          availableBalance: a.availableBalance,
          ledgerBalance: a.ledgerBalance,
          status: a.status as any,
          version: a.version,
        },
      });
    }

    console.log('Database seeding successfully completed.');
  } catch (err) {
    console.error('Database seeding error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
