import { db } from './db';
import { client, payments, sales, salesDetails } from '../schemas/sales';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function seedSales(coreData: any, inventoryData: any) {
  const { farmacia, sucursalNorte } = coreData.businessUnits;
  const { owner } = coreData.users;
  const {
    paracetamol,
    jabonAntibacterial,
    amoxicilina,
    ibuprofeno,
    loratadina,
    protectorSolar,
    omeprazol,
    inyectable,
    tomaPresion,
    losartan,
    formulaInfantil,
  } = inventoryData.products;

  console.log('🛒 Creando Clientes...');
  const allClients = await db
    .insert(client)
    .values([
      // ─── Farmacia ──────────────────────
      { firstName: 'Cliente', lastName: 'Mostrador', businessUnitId: farmacia.id },
      { firstName: 'María', lastName: 'López', phoneNumber: '8844-1122', businessUnitId: farmacia.id },
      { firstName: 'José', lastName: 'Martínez', phoneNumber: '8855-3344', businessUnitId: farmacia.id },
      { firstName: 'Rosa', lastName: 'Hernández', phoneNumber: '8866-5566', businessUnitId: farmacia.id, creditLimit: '500.00' },
      { firstName: 'Pedro', lastName: 'García', phoneNumber: '8877-7788', businessUnitId: farmacia.id },
      // ─── Sucursal Norte ────────────────
      { firstName: 'Doña María', lastName: 'Gómez', phoneNumber: '8888-9999', businessUnitId: sucursalNorte.id },
      { firstName: 'Carlos', lastName: 'Pérez', phoneNumber: '8899-1100', businessUnitId: sucursalNorte.id },
      { firstName: 'Ana', lastName: 'Rivera', phoneNumber: '8811-2233', businessUnitId: sucursalNorte.id },
    ])
    .returning({ id: client.id });

  const [
    clienteMostrador,
    mariaLopez,
    joseMartinez,
    rosaHernandez,
    pedroGarcia,
    donaMariaNorte,
    carlosPNorte,
    anaRiveraNorte,
  ] = allClients;

  console.log('💰 Registrando Ventas (últimos 30 días)...');

  // ─── Sale 1: Farmacia — Mostrador, cash, 2 days ago ────────
  const [v1] = await db.insert(sales).values([{
    clientId: clienteMostrador.id,
    userId: owner.id,
    subTotal: '150.00',
    discountAmount: '0.00',
    totalAmount: '150.00',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    businessUnitId: farmacia.id,
    createdAt: daysAgo(2),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([{
    saleId: v1.id, productId: paracetamol.id, quantity: 1,
    unitPrice: '150.00', lineDiscount: '0.00', businessUnitId: farmacia.id,
  }]);
  await db.insert(payments).values([{
    saleId: v1.id, clientId: clienteMostrador.id, userId: owner.id,
    amount: '150.00', paymentMethod: 'CASH', businessUnitId: farmacia.id,
  }]);

  // ─── Sale 2: Farmacia — María López, card, 5 days ago ──────
  const [v2] = await db.insert(sales).values([{
    clientId: mariaLopez.id,
    userId: owner.id,
    subTotal: '257.50',
    discountAmount: '10.00',
    totalAmount: '247.50',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    businessUnitId: farmacia.id,
    createdAt: daysAgo(5),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v2.id, productId: amoxicilina.id, quantity: 1, unitPrice: '121.50', lineDiscount: '0.00', businessUnitId: farmacia.id },
    { saleId: v2.id, productId: ibuprofeno.id, quantity: 1, unitPrice: '91.00', lineDiscount: '10.00', businessUnitId: farmacia.id },
    { saleId: v2.id, productId: jabonAntibacterial.id, quantity: 1, unitPrice: '45.00', lineDiscount: '0.00', businessUnitId: farmacia.id },
  ]);
  await db.insert(payments).values([{
    saleId: v2.id, clientId: mariaLopez.id, userId: owner.id,
    amount: '247.50', paymentMethod: 'CARD', businessUnitId: farmacia.id,
  }]);

  // ─── Sale 3: Farmacia — Rosa (credit), 10 days ago ─────────
  const [v3] = await db.insert(sales).values([{
    clientId: rosaHernandez.id,
    userId: owner.id,
    subTotal: '275.75',
    discountAmount: '0.00',
    totalAmount: '275.75',
    paymentMethod: 'CREDIT',
    paymentStatus: 'PENDING',
    businessUnitId: farmacia.id,
    createdAt: daysAgo(10),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v3.id, productId: protectorSolar.id, quantity: 1, unitPrice: '225.00', lineDiscount: '0.00', businessUnitId: farmacia.id },
    { saleId: v3.id, productId: loratadina.id, quantity: 1, unitPrice: '50.75', lineDiscount: '0.00', businessUnitId: farmacia.id },
  ]);

  // ─── Sale 4: Farmacia — Pedro, transfer, 15 days ago ───────
  const [v4] = await db.insert(sales).values([{
    clientId: pedroGarcia.id,
    userId: owner.id,
    subTotal: '300.00',
    discountAmount: '0.00',
    totalAmount: '300.00',
    paymentMethod: 'TRANSFER',
    paymentStatus: 'PAID',
    businessUnitId: farmacia.id,
    createdAt: daysAgo(15),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v4.id, productId: paracetamol.id, quantity: 2, unitPrice: '150.00', lineDiscount: '0.00', businessUnitId: farmacia.id },
  ]);
  await db.insert(payments).values([{
    saleId: v4.id, clientId: pedroGarcia.id, userId: owner.id,
    amount: '300.00', paymentMethod: 'TRANSFER', businessUnitId: farmacia.id,
  }]);

  // ─── Sale 5: Farmacia — José, cash, today ──────────────────
  const [v5] = await db.insert(sales).values([{
    clientId: joseMartinez.id,
    userId: owner.id,
    subTotal: '91.00',
    discountAmount: '0.00',
    totalAmount: '91.00',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    businessUnitId: farmacia.id,
    createdAt: daysAgo(0),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v5.id, productId: ibuprofeno.id, quantity: 1, unitPrice: '91.00', lineDiscount: '0.00', businessUnitId: farmacia.id },
  ]);
  await db.insert(payments).values([{
    saleId: v5.id, clientId: joseMartinez.id, userId: owner.id,
    amount: '91.00', paymentMethod: 'CASH', businessUnitId: farmacia.id,
  }]);

  // ─── Sale 6: Norte — Doña María, omeprazol + inyectable, 3 days ago
  const [v6] = await db.insert(sales).values([{
    clientId: donaMariaNorte.id,
    userId: owner.id,
    subTotal: '134.00',
    discountAmount: '0.00',
    totalAmount: '134.00',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    businessUnitId: sucursalNorte.id,
    createdAt: daysAgo(3),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v6.id, productId: inyectable.id, quantity: 1, unitPrice: '50.00', lineDiscount: '0.00', businessUnitId: sucursalNorte.id },
    { saleId: v6.id, productId: omeprazol.id, quantity: 1, unitPrice: '84.00', lineDiscount: '0.00', businessUnitId: sucursalNorte.id },
  ]);
  await db.insert(payments).values([{
    saleId: v6.id, clientId: donaMariaNorte.id, userId: owner.id,
    amount: '134.00', paymentMethod: 'CASH', businessUnitId: sucursalNorte.id,
  }]);

  // ─── Sale 7: Norte — Carlos, presión + losartán, card, 7 days ago
  const [v7] = await db.insert(sales).values([{
    clientId: carlosPNorte.id,
    userId: owner.id,
    subTotal: '163.50',
    discountAmount: '0.00',
    totalAmount: '163.50',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    businessUnitId: sucursalNorte.id,
    createdAt: daysAgo(7),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v7.id, productId: tomaPresion.id, quantity: 1, unitPrice: '15.00', lineDiscount: '0.00', businessUnitId: sucursalNorte.id },
    { saleId: v7.id, productId: losartan.id, quantity: 1, unitPrice: '148.50', lineDiscount: '0.00', businessUnitId: sucursalNorte.id },
  ]);
  await db.insert(payments).values([{
    saleId: v7.id, clientId: carlosPNorte.id, userId: owner.id,
    amount: '163.50', paymentMethod: 'CARD', businessUnitId: sucursalNorte.id,
  }]);

  // ─── Sale 8: Norte — Ana, fórmula + presión, today ───────────
  const [v8] = await db.insert(sales).values([{
    clientId: anaRiveraNorte.id,
    userId: owner.id,
    subTotal: '639.00',
    discountAmount: '24.00',
    totalAmount: '615.00',
    paymentMethod: 'TRANSFER',
    paymentStatus: 'PAID',
    businessUnitId: sucursalNorte.id,
    createdAt: daysAgo(0),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v8.id, productId: formulaInfantil.id, quantity: 1, unitPrice: '624.00', lineDiscount: '24.00', businessUnitId: sucursalNorte.id },
    { saleId: v8.id, productId: tomaPresion.id, quantity: 1, unitPrice: '15.00', lineDiscount: '0.00', businessUnitId: sucursalNorte.id },
  ]);
  await db.insert(payments).values([{
    saleId: v8.id, clientId: anaRiveraNorte.id, userId: owner.id,
    amount: '615.00', paymentMethod: 'TRANSFER', businessUnitId: sucursalNorte.id,
  }]);

  return {
    clients: { clienteMostrador, mariaLopez, joseMartinez, rosaHernandez, pedroGarcia, donaMariaNorte, carlosPNorte, anaRiveraNorte },
    sales: { v1, v2, v3, v4, v5, v6, v7, v8 },
  };
}
