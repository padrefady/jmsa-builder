import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { unlink } from 'fs/promises';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const media = await db.cmsMedia.findUnique({
      where: { id },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Média non trouvé' },
        { status: 404 }
      );
    }

    // Try to delete the physical file (ignore errors if file doesn't exist)
    try {
      await unlink(media.filepath);
    } catch {
      // File might not exist, continue with database deletion
    }

    await db.cmsMedia.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Média supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du média:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
