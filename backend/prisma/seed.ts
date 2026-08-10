import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create seed users
  const users = [
    { name: 'Admin User', email: 'admin@erp.com', password: '123456', role: 'ADMIN' as const },
    { name: 'Sales Manager', email: 'sales@erp.com', password: '123456', role: 'SALES' as const },
    { name: 'Warehouse Manager', email: 'warehouse@erp.com', password: '123456', role: 'WAREHOUSE' as const },
    { name: 'Accounts Manager', email: 'accounts@erp.com', password: '123456', role: 'ACCOUNTS' as const },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: { ...u, password: await bcrypt.hash(u.password, 10) }
      });
      console.log(`✅ Created user: ${u.email}`);
    } else {
      console.log(`⏭️  User already exists: ${u.email}`);
    }
  }

  // Create sample customers
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@erp.com' } });
  
  const customers = [
    {
      name: 'Rajesh Sharma',
      mobile: '9876543210',
      email: 'rajesh@sharma.com',
      businessName: 'Sharma Traders Pvt. Ltd.',
      gstNumber: '27AAPFU0939F1ZV',
      type: 'WHOLESALE' as const,
      address: '45, MG Road, Mumbai, Maharashtra - 400001',
      status: 'ACTIVE' as const,
      notes: 'Premium wholesale customer, bulk orders every month',
      followUpDate: new Date('2024-12-15'),
    },
    {
      name: 'Priya Mehta',
      mobile: '9988776655',
      email: 'priya@mehtaretail.com',
      businessName: 'Mehta Retail Stores',
      type: 'RETAIL' as const,
      address: '12, Linking Road, Bandra, Mumbai - 400050',
      status: 'ACTIVE' as const,
      notes: 'New customer, interested in electronics category',
    },
    {
      name: 'Vikram Singh',
      mobile: '9123456789',
      email: 'vikram@vdistrib.com',
      businessName: 'VD Distributors',
      gstNumber: '07AAKFU0939F1ZV',
      type: 'DISTRIBUTOR' as const,
      address: 'Plot 22, Industrial Area, Delhi - 110020',
      status: 'LEAD' as const,
      notes: 'Lead from trade fair, follow up needed',
      followUpDate: new Date('2024-11-30'),
    },
  ];

  for (const c of customers) {
    const existing = await prisma.customer.findFirst({ where: { email: c.email } });
    if (!existing) {
      await prisma.customer.create({ data: c });
      console.log(`✅ Created customer: ${c.businessName}`);
    } else {
      console.log(`⏭️  Customer already exists: ${c.businessName}`);
    }
  }

  // Create sample products
  const products = [
    {
      name: 'Wireless Bluetooth Mouse',
      sku: 'ELEC-MS-001',
      category: 'Electronics',
      unitPrice: 899.00,
      currentStock: 150,
      minStockAlert: 20,
      location: 'Warehouse A - Shelf 3',
    },
    {
      name: 'USB-C Charging Cable (2m)',
      sku: 'ELEC-CB-002',
      category: 'Electronics',
      unitPrice: 299.00,
      currentStock: 500,
      minStockAlert: 50,
      location: 'Warehouse A - Shelf 1',
    },
    {
      name: 'Office Chair - Ergonomic',
      sku: 'FURN-CH-001',
      category: 'Furniture',
      unitPrice: 8500.00,
      currentStock: 8,
      minStockAlert: 5,
      location: 'Warehouse B - Zone 2',
    },
    {
      name: 'A4 Printing Paper (500 Sheets)',
      sku: 'STAT-PP-001',
      category: 'Stationery',
      unitPrice: 250.00,
      currentStock: 12,
      minStockAlert: 20,
      location: 'Warehouse A - Shelf 5',
    },
    {
      name: 'LED Desk Lamp',
      sku: 'ELEC-LMP-003',
      category: 'Electronics',
      unitPrice: 1299.00,
      currentStock: 75,
      minStockAlert: 10,
      location: 'Warehouse A - Shelf 4',
    },
  ];

  const warehouseUser = await prisma.user.findUnique({ where: { email: 'warehouse@erp.com' } });

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (!existing) {
      const product = await prisma.product.create({ data: p });
      // Create initial stock movement
      if (warehouseUser) {
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            quantity: p.currentStock,
            type: 'IN',
            reason: 'Initial Stock Entry',
            userId: warehouseUser.id,
          }
        });
      }
      console.log(`✅ Created product: ${p.name} (Stock: ${p.currentStock})`);
    } else {
      console.log(`⏭️  Product already exists: ${p.name}`);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:     admin@erp.com     / 123456');
  console.log('  Sales:     sales@erp.com     / 123456');
  console.log('  Warehouse: warehouse@erp.com / 123456');
  console.log('  Accounts:  accounts@erp.com  / 123456');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
