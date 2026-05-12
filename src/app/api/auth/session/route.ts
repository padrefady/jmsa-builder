import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user: session });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
