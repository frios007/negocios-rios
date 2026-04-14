import { db } from './db';
import { businessUnits, userBusinessUnits, users } from '../schemas/core';
import * as bcrypt from 'bcrypt';

export async function seedCore() {
  const password = process.env.SEED_OWNER_PASSWORD || 'contra123';

  console.log('🏢 Creando Unidades de Negocio...');
  const [farmacia, veterinaria] = await db
    .insert(businessUnits)
    .values([
      { name: 'Farmacia Ríos', slug: 'farmacia-rios', type: 'PHARMACY' as const },
      { name: 'Veterinaria Ríos', slug: 'veterinaria-rios', type: 'VETERINARY' as const },
    ])
    .returning({ id: businessUnits.id });

  console.log('👤 Creando Usuario Propietario (Modesto Ríos)...');
  const hash = await bcrypt.hash(password, 10);

  const [owner] = await db
    .insert(users)
    .values([
      {
        firstName: 'Modesto',
        lastName: 'Ríos',
        username: 'modesto72',
        passwordHash: hash,
        phoneNumber: '88871894',
      },
    ])
    .returning({ id: users.id });

  console.log('🔑 Asignando Rol OWNER en ambos negocios...');
  await db.insert(userBusinessUnits).values([
    { userId: owner.id, businessUnitId: farmacia.id, role: 'OWNER' },
    { userId: owner.id, businessUnitId: veterinaria.id, role: 'OWNER' },
  ]);

  return {
    businessUnits: { farmacia, veterinaria },
    users: { owner },
  };
}
