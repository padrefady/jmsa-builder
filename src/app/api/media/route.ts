import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

// GET /api/media - Lister les médias (filtrable par clientId)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    if (clientId) where.clientId = clientId;
    if (category) where.category = category;

    const media = await db.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error('GET media error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/media - Upload de fichier(s)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await request.formData();
    const clientId = formData.get('clientId') as string;
    const category = (formData.get('category') as string) || 'document';
    const files = formData.getAll('files') as File[];

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId est requis' },
        { status: 400 }
      );
    }

    // Vérifier que le client existe
    const client = await db.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { error: 'Client introuvable' },
        { status: 404 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    const { mkdir, writeFile } = await import('fs/promises');
    const { join } = await import('path');
    const { randomUUID } = await import('crypto');

    const uploadDir = join(process.cwd(), 'public', 'uploads', clientId);
    await mkdir(uploadDir, { recursive: true });

    const uploadedMedia = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Générer un nom de fichier unique pour éviter les collisions
      const ext = file.name.split('.').pop() || '';
      const uniqueName = `${randomUUID()}.${ext}`;
      const filePath = join(uploadDir, uniqueName);
      const dbPath = `uploads/${clientId}/${uniqueName}`;

      await writeFile(filePath, buffer);

      const media = await db.media.create({
        data: {
          filename: uniqueName,
          originalName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          path: dbPath,
          clientId: clientId,
          category: category,
        },
      });

      uploadedMedia.push(media);
    }

    return NextResponse.json(
      { media: uploadedMedia, count: uploadedMedia.length },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST media error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
