'use client';

import { useCMSStore } from '@/store/cms-store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SitesView from '@/components/cms/SitesView';

export default function SitesPage() {
  const { isPendingUser, checkSession, fetchDashboard } = useCMSStore();
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const isPending = isPendingUser();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500">Cette section sera disponible apres activation de votre compte.</p>
        </div>
      </div>
    );
  }

  return <SitesView />;
}
