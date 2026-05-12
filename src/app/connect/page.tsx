'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSStore } from '@/store/cms-store';
import AuthView from '@/components/cms/AuthView';

export default function ConnectPage() {
  const router = useRouter();
  const { isAuthenticated, notifications } = useCMSStore();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Listen for successful login/register via store notifications
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  return <AuthView />;
}
