import { Injectable } from '@nestjs/common';
import { Database, DbTransaction } from '@/core/database/database.provider';
import { refreshTokens } from '@/core/database/schemas/core/core.tables';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthRepository extends Database {
  async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    tx?: DbTransaction,
  ) {
    const [token] = await this.getClient(tx)
      .insert(refreshTokens)
      .values({ userId, tokenHash, expiresAt })
      .returning();
    return token;
  }

  async findRefreshTokenByUserId(userId: string, tx?: DbTransaction) {
    return this.getClient(tx).query.refreshTokens.findFirst({
      where: eq(refreshTokens.userId, userId),
    });
  }

  async deleteRefreshToken(id: string, tx?: DbTransaction) {
    return this.getClient(tx)
      .delete(refreshTokens)
      .where(eq(refreshTokens.id, id));
  }

  async deleteAllUserRefreshTokens(userId: string, tx?: DbTransaction) {
    return this.getClient(tx)
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, userId));
  }
}
