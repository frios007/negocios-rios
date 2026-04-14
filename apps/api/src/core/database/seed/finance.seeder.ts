import { db } from './db';
import { expenseCategories, expenses } from '../schemas/sales';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const EXPENSE_ITEMS = [
  'Pago de luz del mes',
  'Compra de materiales de limpieza',
  'Pago a proveedor de medicamentos',
  'Mantenimiento de equipo',
  'Publicidad en redes sociales',
  'Pago de internet',
  'Transporte de mercancía',
  'Reparación de aire acondicionado',
  'Compra de papelería',
  'Pago parcial de alquiler',
  'Pago de agua',
  'Uniformes del personal',
  'Recarga de combustible',
  'Servicio de fumigación',
  'Suministros de oficina',
];

export async function seedFinance(coreData: any) {
  const { farmacia, veterinaria } = coreData.businessUnits;
  const { owner } = coreData.users;

  console.log('💸 Creando Categorías de Gastos...');

  const defaultCategories = [
    'Alquiler / Renta',
    'Servicios (agua, luz, internet)',
    'Sueldos y salarios',
    'Compra de insumos',
    'Mantenimiento',
    'Publicidad',
    'Transporte',
    'Otros',
  ];

  const createdCategories: { id: string; businessUnitId: string }[] = [];

  for (const bu of [farmacia, veterinaria]) {
    for (const name of defaultCategories) {
      const [cat] = await db
        .insert(expenseCategories)
        .values({ name, businessUnitId: bu.id })
        .returning();
      createdCategories.push(cat);
    }
  }

  console.log('💰 Registrando Gastos (últimos 90 días)...');

  const methods = ['CASH', 'CARD', 'TRANSFER'] as const;
  const amounts = [
    '150.00', '250.00', '75.00', '1200.00', '500.00',
    '350.00', '180.00', '95.00', '2000.00', '420.00',
    '600.00', '110.00', '285.00', '750.00', '45.00',
  ];

  for (const bu of [farmacia, veterinaria]) {
    const buCategories = createdCategories.filter(
      (c) => c.businessUnitId === bu.id,
    );

    for (let i = 0; i < 15; i++) {
      const dayOffset = Math.floor((i / 15) * 90);
      await db.insert(expenses).values({
        description: EXPENSE_ITEMS[i],
        amount: amounts[i],
        categoryId: buCategories[i % buCategories.length].id,
        userId: owner.id,
        businessUnitId: bu.id,
        expenseDate: daysAgo(dayOffset + i * 2),
        paymentMethod: methods[i % methods.length],
        notes: i % 3 === 0 ? 'Gasto mensual recurrente' : null,
      });
    }
  }
}
