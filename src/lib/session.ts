import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export interface SessionData {
  adminId: string;
  email: string;
  name: string;
}

const SESSION_COOKIE = 'jmsa_session';
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 heures

// Sessions en mémoire (pour SQLite/local dev)
const sessions = new Map<string, { data: SessionData; expires: number }>();

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

export async function createSession(email: string, password: string): Promise<SessionData | null> {
  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin) return null;

  const isValid = await verifyPassword(password, admin.password);
  if (!isValid) return null;

  const sessionData: SessionData = {
    adminId: admin.id,
    email: admin.email,
    name: admin.name,
  };

  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    data: sessionData,
    expires: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return sessionData;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const session = sessions.get(sessionId);
  if (!session) return null;

  if (Date.now() > session.expires) {
    sessions.delete(sessionId);
    return null;
  }

  return session.data;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    sessions.delete(sessionId);
  }

  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
