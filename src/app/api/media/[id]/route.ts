import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';

// DELETE /api/media/[id] - Supprimer un média
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const media = await db.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: 'Média introuvable' }, { status: 404 });
    }

    // Supprimer le fichier physique
    try {
      await unlink(join(process.cwd(), 'public', media.path));
    } catch {
      // Le fichier peut ne pas exister physiquement
    }

    await db.media.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE media error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
