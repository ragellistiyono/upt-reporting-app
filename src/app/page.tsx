'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in, redirect to login
        router.push('/login');
      } else if (role === 'admin') {
        // Admin user, redirect to admin dashboard
        router.push('/admin');
      } else if (role === 'uptuser') {
        // UPT user, redirect to UPT dashboard
        router.push('/upt');
      }
    }
  }, [role, isLoading, isAuthenticated, router]);

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-6" />
        <h1 className="text-neon-blue text-2xl font-mono font-bold mb-2">
          INITIALIZING SYSTEM...
        </h1>
        <p className="text-cyber-text-dim font-mono text-sm">
          {'>'} Establishing secure connection
        </p>
        <p className="text-cyber-text-dim font-mono text-sm">
          {'>'} Loading neural interface
        </p>
        <p className="text-cyber-text-dim font-mono text-sm">
          {'>'} Verifying credentials
        </p>
      </div>
    </div>
  );
}

