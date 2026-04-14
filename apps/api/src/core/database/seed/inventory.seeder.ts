import { db } from './db';
import { categories, products, stockMovements, suppliers } from '../schemas/inventory';

export async function seedInventory(coreData: any) {
  const { farmacia, veterinaria } = coreData.businessUnits;
  const { owner } = coreData.users;

  console.log('📦 Creando Categorías...');
  const [catMedFarma, catCuidadoFarma, catMedVet, catServVet, catAlimentoVet] = await db
    .insert(categories)
    .values([
      {
        name: 'Medicamentos Éticos',
        businessUnitId: farmacia.id,
        description: 'Medicamentos de venta con receta o de venta libre',
      },
      {
        name: 'Cuidado Personal',
        businessUnitId: farmacia.id,
        description: 'Productos de higiene y belleza',
      },
      {
        name: 'Medicinas y Vacunas',
        businessUnitId: veterinaria.id,
        description: 'Medicamentos y vacunas veterinarias',
      },
      {
        name: 'Servicios Clínicos',
        businessUnitId: veterinaria.id,
        description: 'Consultas, cirugías y procedimientos',
      },
      {
        name: 'Alimentos y Accesorios',
        businessUnitId: veterinaria.id,
        description: 'Comida para mascotas y accesorios',
      },
    ])
    .returning({ id: categories.id });

  console.log('🚚 Creando Proveedores...');
  const [drogueriaNac, distVeterinaria, labBayer] = await db
    .insert(suppliers)
    .values([
      {
        name: 'Droguería Nacional S.A.',
        phoneNumber: '2222-1111',
        businessUnitId: farmacia.id,
      },
      {
        name: 'Distribuidora Veterinaria del Sur',
        phoneNumber: '2222-2222',
        businessUnitId: veterinaria.id,
      },
      {
        name: 'Laboratorios Bayer',
        phoneNumber: '2255-3300',
        businessUnitId: farmacia.id,
      },
    ])
    .returning({ id: suppliers.id });

  console.log('💊 Poblando Inventario...');
  const baseProducts = await db
    .insert(products)
    .values([
      // ─── Farmacia ──────────────────────────────
      {
        barcode: '7421111111111',
        name: 'Paracetamol 500mg (Caja x100)',
        costPrice: '115.38',
        profitMargin: '30.00',
        unitPrice: '150.00',
        stockQuantity: 50,
        isActive: true,
        isSample: false,
        categoryId: catMedFarma.id,
        supplierId: drogueriaNac.id,
        businessUnitId: farmacia.id,
        description: 'Analgésico y antipirético',
      },
      {
        barcode: '7422222222222',
        name: 'Jabón Antibacterial',
        costPrice: '30.00',
        profitMargin: '50.00',
        unitPrice: '45.00',
        stockQuantity: 30,
        isActive: true,
        isSample: false,
        categoryId: catCuidadoFarma.id,
        supplierId: drogueriaNac.id,
        businessUnitId: farmacia.id,
        description: 'Elimina el 99.9% de bacterias',
      },
      {
        barcode: null,
        name: 'Vitamina C (Muestra Médica)',
        costPrice: '0.00',
        profitMargin: '0.00',
        unitPrice: '0.00',
        stockQuantity: 18,
        isActive: true,
        isSample: true,
        categoryId: catMedFarma.id,
        supplierId: null,
        businessUnitId: farmacia.id,
        description: 'Fortalece el sistema inmune',
      },
      {
        barcode: '7421113333333',
        name: 'Amoxicilina 500mg (Caja x21)',
        costPrice: '90.00',
        profitMargin: '35.00',
        unitPrice: '121.50',
        stockQuantity: 25,
        isActive: true,
        isSample: false,
        categoryId: catMedFarma.id,
        supplierId: labBayer.id,
        businessUnitId: farmacia.id,
        description: 'Antibiótico de amplio espectro',
      },
      {
        barcode: '7421114444444',
        name: 'Ibuprofeno 400mg (Caja x30)',
        costPrice: '65.00',
        profitMargin: '40.00',
        unitPrice: '91.00',
        stockQuantity: 40,
        isActive: true,
        isSample: false,
        categoryId: catMedFarma.id,
        supplierId: drogueriaNac.id,
        businessUnitId: farmacia.id,
        description: 'Antiinflamatorio y analgésico',
      },
      {
        barcode: '7421115555555',
        name: 'Loratadina 10mg (Caja x10)',
        costPrice: '35.00',
        profitMargin: '45.00',
        unitPrice: '50.75',
        stockQuantity: 20,
        isActive: true,
        isSample: false,
        categoryId: catMedFarma.id,
        supplierId: drogueriaNac.id,
        businessUnitId: farmacia.id,
        description: 'Antihistamínico para alergias',
      },
      {
        barcode: '7422226666666',
        name: 'Protector Solar SPF 50',
        costPrice: '180.00',
        profitMargin: '25.00',
        unitPrice: '225.00',
        stockQuantity: 12,
        isActive: true,
        isSample: false,
        categoryId: catCuidadoFarma.id,
        supplierId: labBayer.id,
        businessUnitId: farmacia.id,
        description: 'Protección solar de amplio espectro',
      },
      // ─── Veterinaria ───────────────────────────
      {
        barcode: '7423333333333',
        name: 'Vacuna Múltiple (Séxtuple)',
        costPrice: '300.00',
        profitMargin: '50.00',
        unitPrice: '450.00',
        stockQuantity: 15,
        isActive: true,
        isSample: false,
        categoryId: catMedVet.id,
        supplierId: distVeterinaria.id,
        businessUnitId: veterinaria.id,
        description: 'Previene 6 enfermedades caninas',
        isRegulated: true,
      },
      {
        barcode: null,
        name: 'Consulta General Veterinaria',
        productType: 'SERVICE',
        costPrice: '200.00',
        profitMargin: '50.00',
        unitPrice: '300.00',
        stockQuantity: 0,
        isActive: true,
        isSample: false,
        categoryId: catServVet.id,
        supplierId: null,
        businessUnitId: veterinaria.id,
        description: 'Consulta de 30 minutos',
      },
      {
        barcode: null,
        name: 'Desparasitación',
        productType: 'SERVICE',
        costPrice: '50.00',
        profitMargin: '100.00',
        unitPrice: '100.00',
        stockQuantity: 0,
        isActive: true,
        isSample: false,
        categoryId: catServVet.id,
        supplierId: null,
        businessUnitId: veterinaria.id,
        description: 'Desparasitación interna y externa',
      },
      {
        barcode: '7423337777777',
        name: 'Vacuna Antirábica',
        costPrice: '150.00',
        profitMargin: '60.00',
        unitPrice: '240.00',
        stockQuantity: 20,
        isActive: true,
        isSample: false,
        categoryId: catMedVet.id,
        supplierId: distVeterinaria.id,
        businessUnitId: veterinaria.id,
        description: 'Vacuna obligatoria contra la rabia',
        isRegulated: true,
      },
      {
        barcode: '7423338888888',
        name: 'Dog Chow Adulto 18kg',
        costPrice: '650.00',
        profitMargin: '20.00',
        unitPrice: '780.00',
        stockQuantity: 8,
        isActive: true,
        isSample: false,
        categoryId: catAlimentoVet.id,
        supplierId: distVeterinaria.id,
        businessUnitId: veterinaria.id,
        description: 'Alimento seco para perros adultos',
      },
    ])
    .returning({ id: products.id });

  const [
    paracetamol,
    jabonAntibacterial,
    vitaminaC,
    amoxicilina,
    ibuprofeno,
    loratadina,
    protectorSolar,
    vacunaMultiple,
    consultaServicio,
    desparasitacion,
    vacunaAntirabica,
    dogChow,
  ] = baseProducts;

  console.log('🔄 Registrando Movimientos de Inventario (Kardex)...');
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  await db.insert(stockMovements).values([
    {
      productId: paracetamol.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 51,
      batchNumber: 'LOTE-PAR-2301',
      expirationDate: nextYear,
      notes: 'Compra inicial a Droguería Nacional',
      businessUnitId: farmacia.id,
    },
    {
      productId: amoxicilina.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 25,
      batchNumber: 'LOTE-AMX-2401',
      expirationDate: nextYear,
      notes: 'Ingreso inicial de antibióticos',
      businessUnitId: farmacia.id,
    },
    {
      productId: vacunaMultiple.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 16,
      batchNumber: 'VET-VAC-992',
      expirationDate: nextYear,
      notes: 'Ingreso directo a cadena de frío',
      businessUnitId: veterinaria.id,
    },
    {
      productId: vacunaAntirabica.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 20,
      batchNumber: 'VET-RAB-550',
      expirationDate: nextYear,
      notes: 'Compra semestral de antirrábica',
      businessUnitId: veterinaria.id,
    },
    {
      productId: vitaminaC.id,
      userId: owner.id,
      type: 'ADJUSTMENT_OUT',
      quantity: 2,
      notes: 'Cajas aplastadas por humedad',
      businessUnitId: farmacia.id,
    },
    {
      productId: jabonAntibacterial.id,
      userId: owner.id,
      type: 'ADJUSTMENT_IN',
      quantity: 5,
      notes: 'Se encontraron jabones extra durante el conteo físico',
      businessUnitId: farmacia.id,
    },
    {
      productId: dogChow.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 8,
      batchNumber: 'DC-AD-1824',
      notes: 'Compra inicial alimento mascotas',
      businessUnitId: veterinaria.id,
    },
  ]);

  return {
    categories: { catMedFarma, catCuidadoFarma, catMedVet, catServVet, catAlimentoVet },
    suppliers: { drogueriaNac, distVeterinaria, labBayer },
    products: {
      paracetamol,
      jabonAntibacterial,
      vitaminaC,
      amoxicilina,
      ibuprofeno,
      loratadina,
      protectorSolar,
      vacunaMultiple,
      consultaServicio,
      desparasitacion,
      vacunaAntirabica,
      dogChow,
    },
  };
}
