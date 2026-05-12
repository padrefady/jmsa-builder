import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

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
    const { name, slug, description, color } = body;

    const existingCategory = await db.cmsCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    if (slug && slug !== existingCategory.slug) {
      const slugExists = await db.cmsCategory.findUnique({
        where: { slug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Une catégorie avec ce slug existe déjà' },
          { status: 409 }
        );
      }
    }

    const category = await db.cmsCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(color !== undefined && { color }),
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    const categoryWithCount = {
      ...category,
      postCount: category._count.posts,
      _count: undefined,
    };

    return NextResponse.json({
      message: 'Catégorie mise à jour avec succès',
      category: categoryWithCount,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
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

    const existingCategory = await db.cmsCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Set posts' categoryId to null before deleting the category
    await db.cmsPost.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await db.cmsCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Catégorie supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
