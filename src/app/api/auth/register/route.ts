import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { Prisma } from '@prisma/client';

/** Detecte si l'erreur vient de la base de donnees (fichier absent, schema non initialise, etc.) */
function isDatabaseError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
    const { name, email, password } = body;

    // Business info (optional)
    const businessName = body.businessName || null;
    const businessType = body.businessType || null;
    const businessDescription = body.businessDescription || null;
    const businessAddress = body.businessAddress || null;
    const businessCity = body.businessCity || null;
    const businessCountry = body.businessCountry || null;
    const phone = body.phone || null;

    // Social media (optional)
    const whatsapp = body.whatsapp || null;
    const facebook = body.facebook || null;
    const instagram = body.instagram || null;
    const tiktok = body.tiktok || null;
    const twitter = body.twitter || null;
    const linkedin = body.linkedin || null;

    // Plan
    const plan = body.plan || 'free';

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis (nom, email, mot de passe)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caracteres' },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe deja' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        businessName,
        businessType,
        businessDescription,
        businessAddress,
        businessCity,
        businessCountry,
        phone,
        whatsapp,
        facebook,
        instagram,
        tiktok,
        twitter,
        linkedin,
        plan,
        status: 'pending',
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'Compte cree avec succes. En attente de validation par JM Services Africa.', user: userWithoutPassword, token },
      { status: 201 }
    );
  } catch (error) {
    console.error('[REGISTER] Erreur lors de l\'inscription :', error);

    // Erreur specifique de la base de donnees
    if (isDatabaseError(error)) {
      console.error('[REGISTER] Base de donnees indisponible. Verifiez que prisma db push a ete execute.');
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

    // Erreur de contrainte unique (email deja pris)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe deja.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'inscription. Veuillez reessayer plus tard.' },
      { status: 500 }
    );
  }
}
