import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminToken } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const token = getAdminToken(request.headers.get('authorization'))
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Run all queries in parallel for performance
    const [
      totalUsers,
      pendingUsers,
      analyzingUsers,
      betaReadyUsers,
      activeUsers,
      totalComments,
      pendingComments,
      recentRegistrations,
    ] = await Promise.all([
      // Total users
      db.user.count(),

      // Users by status
      db.user.count({ where: { status: 'pending' } }),
      db.user.count({ where: { status: 'analyzing' } }),
      db.user.count({ where: { status: 'beta_ready' } }),
      db.user.count({ where: { status: 'active' } }),

      // Total comments
      db.blogComment.count(),

      // Pending (unapproved) comments
      db.blogComment.count({ where: { isApproved: false } }),

      // Recent registrations (last 7 days)
      db.user.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ])

    return NextResponse.json({
      stats: {
        users: {
          total: totalUsers,
          byStatus: {
            pending: pendingUsers,
            analyzing: analyzingUsers,
            beta_ready: betaReadyUsers,
            active: activeUsers,
          },
          recentRegistrations,
        },
        comments: {
          total: totalComments,
          pending: pendingComments,
        },
      },
    })
  } catch (error) {
    console.error('[ADMIN STATS] Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
