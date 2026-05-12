import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { unlink, readdir } from 'fs/promises';
import { join } from 'path';

// GET /api/clients/[id] - Récupérer un client
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const client = await db.client.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('GET client error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/clients/[id] - Mettre à jour un client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const client = await db.client.update({
      where: { id },
      data: {
        name: data.name?.trim() || undefined,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        company: data.company?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
        status: data.status || undefined,
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('PUT client error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/clients/[id] - Supprimer un client et ses fichiers
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

    // Récupérer tous les médias du client pour supprimer les fichiers physiques
    const media = await db.media.findMany({ where: { clientId: id } });
    for (const m of media) {
      try {
        await unlink(join(process.cwd(), 'public', m.path));
      } catch {
        // Fichier peut ne pas exister
      }
    }

    await db.client.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE client error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
