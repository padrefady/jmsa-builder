import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';

// GET /api/clients - Lister tous les clients
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const clients = await db.client.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { media: true } },
      },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('GET clients error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/clients - Créer un client
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const data = await request.json();
    const { name, email, phone, company, address, notes, status } = data;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }

    const client = await db.client.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        company: company?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
        status: status || 'actif',
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('POST client error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
