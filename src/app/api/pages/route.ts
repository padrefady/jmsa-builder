import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, generateToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = {};

    if (status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const pages = await db.cmsPage.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Erreur lors de la récupération des pages:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, status, seoTitle, seoDesc } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Le titre et le slug sont requis' },
        { status: 400 }
      );
    }

    const existingPage = await db.cmsPage.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'Une page avec ce slug existe déjà' },
        { status: 409 }
      );
    }

    const page = await db.cmsPage.create({
      data: {
        title,
        slug,
        content: content || '',
        status: status || 'draft',
        seoTitle: seoTitle || null,
        seoDesc: seoDesc || null,
        authorId: payload.userId,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { message: 'Page créée avec succès', page },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de la création de la page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
