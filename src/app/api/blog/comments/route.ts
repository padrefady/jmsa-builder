import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Rate limiting store (in-memory)
const commentAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_COMMENTS_PER_HOUR = 3;
const HOUR_MS = 3600000;

// Simple HTML sanitization
function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

// Clean up old rate limit entries periodically
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, data] of commentAttempts.entries()) {
    if (now - data.firstAttempt > HOUR_MS) {
      commentAttempts.delete(ip);
    }
  }
}

// GET /api/blog/comments?articleSlug=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleSlug = searchParams.get('articleSlug');

    if (!articleSlug) {
      return NextResponse.json(
        { error: 'Parametre articleSlug requis' },
        { status: 400 }
      );
    }

    // Use $queryRaw to avoid model caching issues
    const comments = await db.$queryRawUnsafe(
      `SELECT id, author, content, website, createdAt FROM BlogComment WHERE articleSlug = ? AND isApproved = 1 ORDER BY createdAt DESC`,
      articleSlug
    );

    // Format dates as ISO strings
    const formatted = (comments as any[]).map(c => ({
      id: c.id,
      author: c.author,
      content: c.content,
      website: c.website,
      createdAt: new Date(c.createdAt).toISOString(),
    }));

    return NextResponse.json({ comments: formatted });
  } catch (error) {
    console.error('[COMMENTS GET]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST /api/blog/comments
export async function POST(request: NextRequest) {
  try {
    cleanupRateLimits();

    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Rate limiting
    const attempt = commentAttempts.get(clientIp);
    if (attempt && attempt.count >= MAX_COMMENTS_PER_HOUR) {
      const elapsed = Date.now() - attempt.firstAttempt;
      const remaining = Math.ceil((HOUR_MS - elapsed) / 60000);
      return NextResponse.json(
        { error: `Trop de commentaires. Reessayez dans ${remaining} minute(s).` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { articleId, articleSlug, author, email, content, website, honeypot } = body;

    // Honeypot check (anti-spam)
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Commentaire enregistre.' });
    }

    // Validation
    if (!articleSlug || !author || !content) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    const sanitizedAuthor = sanitize(author);
    const sanitizedContent = sanitize(content);
    const sanitizedWebsite = website ? sanitize(website) : null;
    const sanitizedEmail = email ? sanitize(email) : null;

    // Length validation
    if (sanitizedAuthor.length < 2 || sanitizedAuthor.length > 50) {
      return NextResponse.json(
        { error: 'Le nom doit contenir entre 2 et 50 caracteres.' },
        { status: 400 }
      );
    }

    if (sanitizedContent.length < 10 || sanitizedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Le commentaire doit contenir entre 10 et 2000 caracteres.' },
        { status: 400 }
      );
    }

    if (sanitizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    if (sanitizedWebsite && !/^https?:\/\/.+\..+/.test(sanitizedWebsite)) {
      return NextResponse.json(
        { error: 'URL du site invalide.' },
        { status: 400 }
      );
    }

    // Update rate limit
    if (attempt) {
      attempt.count += 1;
    } else {
      commentAttempts.set(clientIp, { count: 1, firstAttempt: Date.now() });
    }

    // Create comment using raw SQL (pending approval)
    const id = 'cmt-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    await db.$executeRawUnsafe(
      `INSERT INTO BlogComment (id, articleId, articleSlug, author, email, content, website, ipAddress, userAgent, isApproved, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))`,
      id,
      articleId || articleSlug,
      articleSlug,
      sanitizedAuthor,
      sanitizedEmail,
      sanitizedContent,
      sanitizedWebsite,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Votre commentaire a ete soumis et sera visible apres validation.',
        commentId: id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[COMMENTS POST]', error);
    return NextResponse.json(
      { error: 'Erreur serveur. Veuillez reessayer.' },
      { status: 500 }
    );
  }
}
