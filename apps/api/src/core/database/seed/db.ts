import 'dotenv/config';

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as coreSchema from '../schemas/core';
import * as inventorySchema from '../schemas/inventory';
import * as salesSchema from '../schemas/sales';
import * as clinicalSchema from '../schemas/clinical';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el .env');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, {
  schema: {
    ...coreSchema,
    ...inventorySchema,
    ...salesSchema,
    ...clinicalSchema,
  },
});
