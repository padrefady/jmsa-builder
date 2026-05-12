import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const token = getAdminToken(request.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        businessName: true,
        businessType: true,
        businessDescription: true,
        businessAddress: true,
        businessCity: true,
        businessCountry: true,
        phone: true,
        whatsapp: true,
        facebook: true,
        instagram: true,
        tiktok: true,
        twitter: true,
        linkedin: true,
        status: true,
        plan: true,
        planStartDate: true,
        domain: true,
        betaUrl: true,
        notes: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[ADMIN USERS] Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
