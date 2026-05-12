import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

/** Detecte si l'erreur vient de la base de donnees (fichier absent, schema non initialise, etc.) */
function isDatabaseError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2021: table does not exist, P2003: FK constraint
    return error.code === 'P2021' || error.code === 'P2003';
  }
  const msg = error instanceof Error ? error.message.toLowerCase() : '';
  return (
    msg.includes('database') ||
    msg.includes('sqlite') ||
    msg.includes('no such table') ||
    msg.includes('file is not a database') ||
    msg.includes('unable to open database')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Connexion reussie',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('[LOGIN] Erreur lors de la connexion :', error);

    // Erreur specifique de la base de donnees (fichier absent, schema non pousse, etc.)
    if (isDatabaseError(error)) {
      console.error('[LOGIN] Base de donnees indisponible. Verifiez que prisma db push a ete execute.');
      return NextResponse.json(
        {
          error: 'Service indisponible. La base de donnees n\'est pas initialisee.',
          code: 'DB_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // Erreur de requete JSON invalide
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Requete invalide. Verifiez les donnees envoyees.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur lors de la connexion. Veuillez reessayer plus tard.' },
      { status: 500 }
    );
  }
}
