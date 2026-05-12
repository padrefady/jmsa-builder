import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Créer l'admin par défaut s'il n'existe pas
export async function ensureDefaultAdmin() {
  const existingAdmin = await db.admin.findFirst();
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    await db.admin.create({
      data: {
        email: 'admin@jmsa.com',
        password: hashedPassword,
        name: 'Administrateur',
      },
    });
  }
}
