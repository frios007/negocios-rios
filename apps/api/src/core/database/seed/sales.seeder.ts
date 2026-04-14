import { db } from './db';
import { client, payments, sales, salesDetails } from '../schemas/sales';

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export async function seedSales(coreData: any, inventoryData: any) {
  const { farmacia, veterinaria } = coreData.businessUnits;
  const { owner } = coreData.users;
  const {
    paracetamol,
    jabonAntibacterial,
    amoxicilina,
    ibuprofeno,
    loratadina,
    protectorSolar,
    vacunaMultiple,
    consultaServicio,
    desparasitacion,
    vacunaAntirabica,
    dogChow,
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
      // ─── Veterinaria ───────────────────
      { firstName: 'Doña María', lastName: 'Gómez', phoneNumber: '8888-9999', businessUnitId: veterinaria.id },
      { firstName: 'Carlos', lastName: 'Pérez', phoneNumber: '8899-1100', businessUnitId: veterinaria.id },
      { firstName: 'Ana', lastName: 'Rivera', phoneNumber: '8811-2233', businessUnitId: veterinaria.id },
    ])
    .returning({ id: client.id });

  const [
    clienteMostrador,
    mariaLopez,
    joseMartinez,
    rosaHernandez,
    pedroGarcia,
    donaMariaVet,
    carlosPVet,
    anaRiveraVet,
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

  // ─── Sale 6: Vet — Doña María, consulta + vacuna, 3 days ago
  const [v6] = await db.insert(sales).values([{
    clientId: donaMariaVet.id,
    userId: owner.id,
    subTotal: '750.00',
    discountAmount: '0.00',
    totalAmount: '750.00',
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    businessUnitId: veterinaria.id,
    createdAt: daysAgo(3),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v6.id, productId: consultaServicio.id, quantity: 1, unitPrice: '300.00', lineDiscount: '0.00', businessUnitId: veterinaria.id },
    { saleId: v6.id, productId: vacunaMultiple.id, quantity: 1, unitPrice: '450.00', lineDiscount: '0.00', businessUnitId: veterinaria.id },
  ]);
  await db.insert(payments).values([{
    saleId: v6.id, clientId: donaMariaVet.id, userId: owner.id,
    amount: '750.00', paymentMethod: 'CASH', businessUnitId: veterinaria.id,
  }]);

  // ─── Sale 7: Vet — Carlos, desparasitación, card, 7 days ago
  const [v7] = await db.insert(sales).values([{
    clientId: carlosPVet.id,
    userId: owner.id,
    subTotal: '340.00',
    discountAmount: '0.00',
    totalAmount: '340.00',
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    businessUnitId: veterinaria.id,
    createdAt: daysAgo(7),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v7.id, productId: desparasitacion.id, quantity: 1, unitPrice: '100.00', lineDiscount: '0.00', businessUnitId: veterinaria.id },
    { saleId: v7.id, productId: vacunaAntirabica.id, quantity: 1, unitPrice: '240.00', lineDiscount: '0.00', businessUnitId: veterinaria.id },
  ]);
  await db.insert(payments).values([{
    saleId: v7.id, clientId: carlosPVet.id, userId: owner.id,
    amount: '340.00', paymentMethod: 'CARD', businessUnitId: veterinaria.id,
  }]);

  // ─── Sale 8: Vet — Ana, comida + consulta, today ───────────
  const [v8] = await db.insert(sales).values([{
    clientId: anaRiveraVet.id,
    userId: owner.id,
    subTotal: '1080.00',
    discountAmount: '50.00',
    totalAmount: '1030.00',
    paymentMethod: 'TRANSFER',
    paymentStatus: 'PAID',
    businessUnitId: veterinaria.id,
    createdAt: daysAgo(0),
  }]).returning({ id: sales.id });
  await db.insert(salesDetails).values([
    { saleId: v8.id, productId: dogChow.id, quantity: 1, unitPrice: '780.00', lineDiscount: '50.00', businessUnitId: veterinaria.id },
    { saleId: v8.id, productId: consultaServicio.id, quantity: 1, unitPrice: '300.00', lineDiscount: '0.00', businessUnitId: veterinaria.id },
  ]);
  await db.insert(payments).values([{
    saleId: v8.id, clientId: anaRiveraVet.id, userId: owner.id,
    amount: '1030.00', paymentMethod: 'TRANSFER', businessUnitId: veterinaria.id,
  }]);

  return {
    clients: { clienteMostrador, mariaLopez, joseMartinez, rosaHernandez, pedroGarcia, donaMariaVet, carlosPVet, anaRiveraVet },
    sales: { v1, v2, v3, v4, v5, v6, v7, v8 },
  };
}
