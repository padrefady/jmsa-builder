import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminToken } from '@/lib/admin-auth'

// Type for the fields that can be updated on a user
type UpdatableUserFields = {
  status?: string
  plan?: string
  domain?: string | null
  betaUrl?: string | null
  notes?: string | null
  role?: string
  name?: string
  businessName?: string | null
  businessType?: string | null
  businessDescription?: string | null
  businessAddress?: string | null
  businessCity?: string | null
  businessCountry?: string | null
  phone?: string | null
  whatsapp?: string | null
  facebook?: string | null
  instagram?: string | null
  tiktok?: string | null
  twitter?: string | null
  linkedin?: string | null
}

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const token = getAdminToken(request.headers.get('authorization'))
  return token !== null
}

function excludePassword<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const updateData: UpdatableUserFields = {}

    // Only include fields that are explicitly provided in the body
    const allowedFields: (keyof UpdatableUserFields)[] = [
      'status', 'plan', 'domain', 'betaUrl', 'notes', 'role',
      'name', 'businessName', 'businessType', 'businessDescription',
      'businessAddress', 'businessCity', 'businessCountry', 'phone',
      'whatsapp', 'facebook', 'instagram', 'tiktok', 'twitter', 'linkedin',
    ]

    for (const field of allowedFields) {
      if (field in body) {
        ;(updateData as Record<string, unknown>)[field] = body[field]
      }
    }

    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      user: excludePassword(updatedUser),
    })
  } catch (error) {
    console.error('[ADMIN USER UPDATE] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  try {
    const existingUser = await db.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('[ADMIN USER DELETE] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
