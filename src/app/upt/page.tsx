'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/constants';
import { Query } from 'appwrite';
import type { Submission } from '@/types';

export default function UPTDashboardPage() {
  const { user, role, uptName, isLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Verify UPT user role
  useEffect(() => {
    if (!isLoading && role !== 'uptuser') {
      router.push('/login');
    }
  }, [role, isLoading, router]);

  // Fetch user's submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.$id) return;

      try {
        setIsLoadingData(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.SUBMISSIONS,
          [Query.equal('submitted_by_user', user.$id), Query.orderDesc('$createdAt')]
        );

        setSubmissions(response.documents as unknown as Submission[]);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (role === 'uptuser' && user) {
      fetchSubmissions();
    }
  }, [user, role]);

  // Calculate stats
  const totalSubmissions = submissions.length;

  const thisMonthSubmissions = submissions.filter((sub) => {
    const submissionDate = new Date(sub.submission_date);
    const now = new Date();
    return (
      submissionDate.getMonth() === now.getMonth() &&
      submissionDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const last7DaysSubmissions = submissions.filter((sub) => {
    const submissionDate = new Date(sub.submission_date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return submissionDate >= sevenDaysAgo;
  }).length;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neon-green font-mono">LOADING UPT INTERFACE...</p>
        </div>
      </div>
    );
  }

  if (role !== 'uptuser') {
    return null;
  }

  return (
    <div className="min-h-screen p-8">
      {/* Cyberpunk Header */}
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="bg-cyber-light border-2 border-neon-green rounded-lg p-4 mb-6 shadow-glow-green-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-green rounded-lg flex items-center justify-center shadow-glow-green">
                <span className="text-cyber-dark font-mono font-bold text-xl">⬡</span>
              </div>
              <div>
                <h1 className="text-neon-green text-3xl font-mono font-bold tracking-wider">
                  UPT DASHBOARD
                </h1>
                <p className="text-cyber-text-dim font-mono text-sm">
                  {uptName ? uptName.toUpperCase() : 'UPT USER'} {'//'} REPORTER ACCESS
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-cyber-text font-mono text-sm">{user?.name}</p>
                <p className="text-cyber-text-dim font-mono text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-cyber-dark border-2 border-neon-green text-neon-green px-4 py-2 rounded font-mono
                           hover:bg-neon-green hover:text-cyber-dark hover:shadow-glow-green-sm
                           transition-all duration-300"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1 */}
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-6 shadow-glow-blue-sm hover:shadow-glow-blue transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-neon-blue rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">📝</span>
              </div>
              <h3 className="text-neon-blue font-mono font-bold">MY SUBMISSIONS</h3>
            </div>
            <p className="text-cyber-text text-4xl font-mono font-bold">
              {isLoadingData ? '...' : totalSubmissions}
            </p>
            <p className="text-cyber-text-dim font-mono text-sm mt-1">Total reports sent</p>
          </div>

          {/* Card 2 */}
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-6 shadow-glow-green-sm hover:shadow-glow-green transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-neon-green rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">📅</span>
              </div>
              <h3 className="text-neon-green font-mono font-bold">THIS MONTH</h3>
            </div>
            <p className="text-cyber-text text-4xl font-mono font-bold">
              {isLoadingData ? '...' : thisMonthSubmissions}
            </p>
            <p className="text-cyber-text-dim font-mono text-sm mt-1">New this month</p>
          </div>

          {/* Card 3 */}
          <div className="bg-cyber-darker border-2 border-neon-purple rounded-lg p-6 shadow-glow-purple transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-neon-purple rounded flex items-center justify-center">
                <span className="text-cyber-dark font-bold">📊</span>
              </div>
              <h3 className="text-neon-purple font-mono font-bold">LAST 7 DAYS</h3>
            </div>
            <p className="text-cyber-text text-4xl font-mono font-bold">
              {isLoadingData ? '...' : last7DaysSubmissions}
            </p>
            <p className="text-cyber-text-dim font-mono text-sm mt-1">Recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* New Submission Card */}
          <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg p-8 shadow-glow-blue-sm hover:shadow-glow-blue transition-all">
            <div className="text-center">
              <div className="inline-block p-4 bg-cyber-light border-2 border-neon-blue rounded-lg mb-4">
                <span className="text-neon-blue text-5xl">➕</span>
              </div>
              <h3 className="text-neon-blue text-xl font-mono font-bold mb-3">
                NEW SUBMISSION
              </h3>
              <p className="text-cyber-text-dim font-mono text-sm mb-6">
                Submit a new performance indicator report
              </p>
              <Link
                href="/upt/submit-report"
                className="inline-block bg-neon-blue text-cyber-dark px-6 py-3 rounded font-mono font-bold
                           shadow-glow-blue hover:bg-neon-green hover:shadow-glow-green
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                CREATE REPORT
              </Link>
            </div>
          </div>

          {/* View History Card */}
          <div className="bg-cyber-darker border-2 border-neon-pink rounded-lg p-8 shadow-glow-pink-sm hover:shadow-glow-pink transition-all">
            <div className="text-center">
              <div className="inline-block p-4 bg-cyber-light border-2 border-neon-pink rounded-lg mb-4">
                <span className="text-neon-pink text-5xl">📋</span>
              </div>
              <h3 className="text-neon-pink text-xl font-mono font-bold mb-3">
                MY REPORTS
              </h3>
              <p className="text-cyber-text-dim font-mono text-sm mb-6">
                View your submission history
              </p>
              <Link
                href="/upt/history"
                className="inline-block bg-neon-pink text-cyber-dark px-6 py-3 rounded font-mono font-bold
                           shadow-glow-pink hover:bg-neon-purple hover:shadow-glow-purple
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                VIEW HISTORY
              </Link>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-8 shadow-glow-green-sm">
          <div className="text-center">
            <h2 className="text-neon-green text-2xl font-mono font-bold mb-4">
              WELCOME TO {uptName ? uptName.toUpperCase() : 'UPT SYSTEM'}
            </h2>
            
            <p className="text-cyber-text font-mono mb-6 max-w-2xl mx-auto">
              Kamu terhubung ke UPT Reporting System. 
              Kirimkan indikator kinerja Anda dan pantau kontribusi Anda untuk PLN.
            </p>

            <div className="border-t border-cyber-light pt-6 mt-6">
              <p className="text-neon-green font-mono text-sm">
                {'>'} System Status: ONLINE
              </p>
              <p className="text-cyber-text-dim font-mono text-sm mt-2">
                {'>'} All features operational
              </p>
              <p className="text-cyber-text-dim font-mono text-sm mt-2">
                {'>'} Database sync: Active
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-cyber-text-dim font-mono text-xs">
            <span className="text-neon-green">⬡</span> UPT REPORTING SYSTEM v1.0 Build with 🔥 by Ragel Listiyono 
          </p>
        </div>
      </div>
    </div>
  );
}
