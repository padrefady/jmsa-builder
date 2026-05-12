import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const page = await db.cmsPage.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error('Erreur lors de la récupération de la page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, status, seoTitle, seoDesc } = body;

    const existingPage = await db.cmsPage.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }

    if (slug && slug !== existingPage.slug) {
      const slugExists = await db.cmsPage.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Une page avec ce slug existe déjà' },
          { status: 409 }
        );
      }
    }

    const page = await db.cmsPage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle || null }),
        ...(seoDesc !== undefined && { seoDesc: seoDesc || null }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      message: 'Page mise à jour avec succès',
      page,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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

    const existingPage = await db.cmsPage.findUnique({
      where: { id },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Page non trouvée' },
        { status: 404 }
      );
    }

    await db.cmsPage.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Page supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la page:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
