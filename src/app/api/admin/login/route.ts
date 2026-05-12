import { NextRequest, NextResponse } from 'next/server'
import { generateAdminToken } from '@/lib/admin-auth'

const ADMIN_EMAIL = 'admin@jmsa.builder'
const ADMIN_PASSWORD = 'JMSA@2024!'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = generateAdminToken()
      return NextResponse.json({
        token,
        admin: {
          name: 'JMSA Admin',
          email: ADMIN_EMAIL,
        },
      })
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
