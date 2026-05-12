import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/lib/db-init';

export async function GET() {
  try {
    const dbCheck = await ensureDatabase();

    return NextResponse.json({
      status: 'ok',
      db: dbCheck.ready,
      ...(dbCheck.ready ? {} : { dbError: dbCheck.error }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { status: 'error', db: false, error: message },
      { status: 503 },
    );
  }
}
