import { db } from './db';
import { categories, products, stockMovements, suppliers } from '../schemas/inventory';

export async function seedInventory(coreData: any) {
  const { farmacia, sucursalNorte } = coreData.businessUnits;
  const { owner } = coreData.users;

  console.log('📦 Creando Categorías...');
  const [catMedFarma, catCuidadoFarma, catMedNorte, catServNorte, catNutriNorte] = await db
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
        name: 'Medicamentos Éticos',
        businessUnitId: sucursalNorte.id,
        description: 'Medicamentos de venta con receta o de venta libre',
      },
      {
        name: 'Servicios Farmacéuticos',
        businessUnitId: sucursalNorte.id,
        description: 'Inyectología, toma de presión y glucometría',
      },
      {
        name: 'Nutrición y Suplementos',
        businessUnitId: sucursalNorte.id,
        description: 'Fórmulas infantiles, vitaminas y suplementos',
      },
    ])
    .returning({ id: categories.id });

  console.log('🚚 Creando Proveedores...');
  const [drogueriaNac, distNorte, labBayer] = await db
    .insert(suppliers)
    .values([
      {
        name: 'Droguería Nacional S.A.',
        phoneNumber: '2222-1111',
        businessUnitId: farmacia.id,
      },
      {
        name: 'Distribuidora Farmacéutica del Norte',
        phoneNumber: '2222-2222',
        businessUnitId: sucursalNorte.id,
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
      // ─── Sucursal Norte ────────────────────────
      {
        barcode: '7421116666666',
        name: 'Omeprazol 20mg (Caja x14)',
        costPrice: '60.00',
        profitMargin: '40.00',
        unitPrice: '84.00',
        stockQuantity: 15,
        isActive: true,
        isSample: false,
        categoryId: catMedNorte.id,
        supplierId: distNorte.id,
        businessUnitId: sucursalNorte.id,
        description: 'Inhibidor de la bomba de protones',
        isRegulated: true,
      },
      {
        barcode: null,
        name: 'Aplicación de Inyectable',
        productType: 'SERVICE',
        costPrice: '20.00',
        profitMargin: '150.00',
        unitPrice: '50.00',
        stockQuantity: 0,
        isActive: true,
        isSample: false,
        categoryId: catServNorte.id,
        supplierId: null,
        businessUnitId: sucursalNorte.id,
        description: 'Aplicación intramuscular o subcutánea',
      },
      {
        barcode: null,
        name: 'Toma de Presión Arterial',
        productType: 'SERVICE',
        costPrice: '5.00',
        profitMargin: '200.00',
        unitPrice: '15.00',
        stockQuantity: 0,
        isActive: true,
        isSample: false,
        categoryId: catServNorte.id,
        supplierId: null,
        businessUnitId: sucursalNorte.id,
        description: 'Medición con tensiómetro digital',
      },
      {
        barcode: '7421117777777',
        name: 'Losartán 50mg (Caja x30)',
        costPrice: '110.00',
        profitMargin: '35.00',
        unitPrice: '148.50',
        stockQuantity: 20,
        isActive: true,
        isSample: false,
        categoryId: catMedNorte.id,
        supplierId: distNorte.id,
        businessUnitId: sucursalNorte.id,
        description: 'Antihipertensivo',
        isRegulated: true,
      },
      {
        barcode: '7424448888888',
        name: 'Fórmula Infantil Etapa 1 (900g)',
        costPrice: '520.00',
        profitMargin: '20.00',
        unitPrice: '624.00',
        stockQuantity: 8,
        isActive: true,
        isSample: false,
        categoryId: catNutriNorte.id,
        supplierId: distNorte.id,
        businessUnitId: sucursalNorte.id,
        description: 'Fórmula láctea para lactantes de 0 a 6 meses',
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
    omeprazol,
    inyectable,
    tomaPresion,
    losartan,
    formulaInfantil,
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
      productId: omeprazol.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 16,
      batchNumber: 'LOTE-OMP-992',
      expirationDate: nextYear,
      notes: 'Compra inicial a Distribuidora del Norte',
      businessUnitId: sucursalNorte.id,
    },
    {
      productId: losartan.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 20,
      batchNumber: 'LOTE-LOS-550',
      expirationDate: nextYear,
      notes: 'Compra mensual de antihipertensivos',
      businessUnitId: sucursalNorte.id,
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
      productId: formulaInfantil.id,
      userId: owner.id,
      type: 'PURCHASE_IN',
      quantity: 8,
      batchNumber: 'LOTE-FI1-1824',
      expirationDate: nextYear,
      notes: 'Compra inicial de fórmulas infantiles',
      businessUnitId: sucursalNorte.id,
    },
  ]);

  return {
    categories: { catMedFarma, catCuidadoFarma, catMedNorte, catServNorte, catNutriNorte },
    suppliers: { drogueriaNac, distNorte, labBayer },
    products: {
      paracetamol,
      jabonAntibacterial,
      vitaminaC,
      amoxicilina,
      ibuprofeno,
      loratadina,
      protectorSolar,
      omeprazol,
      inyectable,
      tomaPresion,
      losartan,
      formulaInfantil,
    },
  };
}
