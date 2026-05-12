import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';
import { ensureDefaultAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await ensureDefaultAdmin();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const session = await createSession(email, password);

    if (!session) {
      return NextResponse.json(
        { error: 'Identifiants incorrects' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user: session });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
