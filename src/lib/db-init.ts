import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface DatabaseCheckResult {
  ready: boolean;
  error?: string;
}

/**
 * Verifie que la base de donnees est accessible et fonctionnelle.
 * Execute une requete simple ($queryRaw) pour tester la connexion.
 *
 * Retourne { ready: true } si tout va bien,
 * ou { ready: false, error: string } si la base est indisponible.
 */
export async function ensureDatabase(): Promise<DatabaseCheckResult> {
  try {
    await db.$queryRaw`SELECT 1`;
    return { ready: true };
  } catch (error) {
    const msg =
      error instanceof Prisma.PrismaClientInitializationError
        ? error.message
        : error instanceof Error
          ? error.message
          : 'Erreur inconnue lors de la connexion a la base de donnees.';

    console.error('[DB-INIT] Erreur de connexion a la base de donnees :', msg);
    return { ready: false, error: msg };
  }
}
