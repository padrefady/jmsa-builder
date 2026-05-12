'use client';

import dynamic from 'next/dynamic';

const AdminPanel = dynamic(
  () => import('@/components/admin/AdminPanel').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminPanel onClose={() => window.location.href = '/'} />;
}
