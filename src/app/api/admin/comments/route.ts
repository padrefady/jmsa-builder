import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const token = getAdminToken(request.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const comments = await db.blogComment.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('[ADMIN COMMENTS] Failed to fetch comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const token = getAdminToken(request.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, isApproved } = body

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })
    }

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'isApproved must be a boolean' }, { status: 400 })
    }

    const existingComment = await db.blogComment.findUnique({ where: { id } })
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const updatedComment = await db.blogComment.update({
      where: { id },
      data: { isApproved },
    })

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error('[ADMIN COMMENT UPDATE] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const token = getAdminToken(request.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Comment ID is required (query param)' }, { status: 400 })
    }

    const existingComment = await db.blogComment.findUnique({ where: { id } })
    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await db.blogComment.delete({ where: { id } })

    return NextResponse.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('[ADMIN COMMENT DELETE] Failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
