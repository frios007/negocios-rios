import { Module, Global } from '@nestjs/common';
import { DATABASE_CONNECTION } from './database-connection';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schemas';
import { env } from '@/core/config/env.schema';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const pool = new Pool({
          connectionString: env.DATABASE_URL,
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
