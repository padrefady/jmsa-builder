import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const [
      pages,
      posts,
      publishedPosts,
      categories,
      media,
      recentPosts,
      recentPages,
    ] = await Promise.all([
      db.cmsPage.count(),
      db.cmsPost.count(),
      db.cmsPost.count({ where: { status: 'published' } }),
      db.cmsCategory.count(),
      db.cmsMedia.count(),
      db.cmsPost.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true },
          },
          category: {
            select: { id: true, name: true, slug: true, color: true },
          },
        },
      }),
      db.cmsPage.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      pages,
      posts,
      publishedPosts,
      categories,
      media,
      recentPosts,
      recentPages,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
