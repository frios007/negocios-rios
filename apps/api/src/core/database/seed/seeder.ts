import { db } from './db';
import { businessUnits, users, userBusinessUnits } from '../schemas/core';
import {
  categories,
  products,
  stockMovements,
  suppliers,
} from '../schemas/inventory';
import {
  client,
  payments,
  sales,
  salesDetails,
  expenses,
  expenseCategories,
} from '../schemas/sales';
import {
  patients,
  clinicalRecords,
  hospitalizations,
  hospitalizationNotes,
  hospitalizationItems,
} from '../schemas/clinical';
import { seedCore } from './core.seeder';
import { seedInventory } from './inventory.seeder';
import { seedSales } from './sales.seeder';
import { seedClinical } from './clinical.seeder';
import { seedFinance } from './finance.seeder';
import { count } from 'drizzle-orm';

const isStaging = process.argv.includes('--staging');

async function runSeed() {
  console.log('🌱 Iniciando el proceso de Seeding para Sistemas Ríos...');

  // ─── Idempotent guard for staging ──────────────────────────
  if (isStaging) {
    console.log('🔒 Modo STAGING: verificando si ya existen datos...');
    const [result] = await db.select({ total: count() }).from(users);
    if (result.total > 0) {
      console.log(`✅ Ya existen ${result.total} usuario(s) en la DB. Seeding omitido.`);
      process.exit(0);
    }
    console.log('📦 DB vacía. Ejecutando seed inicial...');
  }

  try {
    // ─── Destructive cleanup (dev only, not staging first run) ─
    if (!isStaging) {
      console.log('🧹 Limpiando base de datos (eliminando datos anteriores)...');
      await db.delete(hospitalizationItems);
      await db.delete(hospitalizationNotes);
      await db.delete(hospitalizations);
      await db.delete(clinicalRecords);
      await db.delete(patients);
      await db.delete(expenses);
      await db.delete(expenseCategories);
      await db.delete(salesDetails);
      await db.delete(payments);
      await db.delete(sales);
      await db.delete(client);
      await db.delete(stockMovements);
      await db.delete(products);
      await db.delete(suppliers);
      await db.delete(categories);
      await db.delete(userBusinessUnits);
      await db.delete(users);
      await db.delete(businessUnits);
    }

    console.log('-------------------------------------------');
    const coreData = await seedCore();
    console.log('-------------------------------------------');
    const inventoryData = await seedInventory(coreData);
    console.log('-------------------------------------------');
    const salesData = await seedSales(coreData, inventoryData);
    console.log('-------------------------------------------');
    await seedClinical(coreData, salesData);
    console.log('-------------------------------------------');
    await seedFinance(coreData);
    console.log('-------------------------------------------');

    console.log('✅ Seeding Completado con Éxito!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
}

runSeed().catch(console.error);
