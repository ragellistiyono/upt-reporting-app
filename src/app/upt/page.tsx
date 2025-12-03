'use client';

import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, INDICATOR_TYPE_LABELS, INDICATOR_TYPES } from '@/lib/constants';
import { Query } from 'appwrite';
import type { Submission, Instruction, InstructionReadStatus, Target } from '@/types';
import InstructionDetailModal from '@/components/InstructionDetailModal';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function UPTDashboardPage() {
  const { user, role, uptName, isLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [instructionReads, setInstructionReads] = useState<InstructionReadStatus[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
  const [isLoadingTargets, setIsLoadingTargets] = useState(true);
  
  // Notification state
  const [showBellDropdown, setShowBellDropdown] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [indicatorFilter, setIndicatorFilter] = useState<string>('all');

  // Verify UPT user role - redirect if not authenticated or not uptuser
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        window.location.href = '/login?redirect=/upt';
      } else if (role !== 'uptuser') {
        // Authenticated but not UPT user, redirect to home
        window.location.href = '/';
      }
    }
  }, [user, role, isLoading]);

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

  // Fetch instructions for this UPT
  useEffect(() => {
    const fetchInstructions = async () => {
      if (!uptName || role !== 'uptuser') return;

      try {
        setIsLoadingInstructions(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
          [
            Query.equal('status', 'PUBLISHED'),
            Query.orderDesc('published_at'),
            Query.limit(50)
          ]
        );

        const filtered = (response.documents as unknown as Instruction[]).filter((inst) => {
          if (inst.target_type === 'ALL') return true;
          if (inst.target_type === 'SPECIFIC' && inst.target_upt) {
            return inst.target_upt.includes(uptName);
          }
          return false;
        });

        setInstructions(filtered);
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
      } finally {
        setIsLoadingInstructions(false);
      }
    };

    fetchInstructions();
  }, [uptName, role]);

  // Fetch instruction read status for current user
  useEffect(() => {
    const fetchReadStatus = async () => {
      if (!user?.$id) return;

      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
          [Query.equal('user_id', user.$id), Query.limit(100)]
        );

        setInstructionReads(response.documents as unknown as InstructionReadStatus[]);
      } catch (error) {
        console.error('Failed to fetch read status:', error);
      }
    };

    if (user) {
      fetchReadStatus();
    }
  }, [user]);

  // Fetch targets for current UPT
  useEffect(() => {
    const fetchTargets = async () => {
      if (!uptName || role !== 'uptuser') return;

      try {
        setIsLoadingTargets(true);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentSemester = currentMonth <= 6 ? 1 : 2;

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.TARGETS,
          [
            Query.equal('upt_name', uptName),
            Query.equal('year', currentYear),
            Query.equal('semester', currentSemester),
            Query.limit(1000)
          ]
        );

        setTargets(response.documents as unknown as Target[]);
      } catch (error) {
        console.error('Failed to fetch targets:', error);
      } finally {
        setIsLoadingTargets(false);
      }
    };

    if (role === 'uptuser' && uptName) {
      fetchTargets();
    }
  }, [uptName, role]);

  // Calculate unread instructions
  const unreadInstructions = useMemo(() => {
    const readIds = new Set(instructionReads.map((r) => r.instruction_id));
    return instructions.filter((inst) => !readIds.has(inst.$id));
  }, [instructions, instructionReads]);

  const unreadCount = unreadInstructions.length;

  // Refresh read status after marking as read
  const handleRefreshReadStatus = async () => {
    if (!user?.$id) return;

    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
        [Query.equal('user_id', user.$id), Query.limit(100)]
      );

      setInstructionReads(response.documents as unknown as InstructionReadStatus[]);
    } catch (error) {
      console.error('Failed to refresh read status:', error);
    }
  };

  const handleViewInstruction = (instruction: Instruction) => {
    setSelectedInstruction(instruction);
    setShowInstructionModal(true);
    setShowBellDropdown(false);
  };

  // Calculate filtered stats based on selected month and year
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const submissionDate = new Date(sub.submission_date);
      return (
        submissionDate.getMonth() === selectedMonth &&
        submissionDate.getFullYear() === selectedYear
      );
    });
  }, [submissions, selectedMonth, selectedYear]);

  // Calculate indicator counts from filtered submissions
  const indicatorCounts = useMemo(() => {
    const counts = Object.fromEntries(
      Object.keys(INDICATOR_TYPE_LABELS).map(key => [key, 0])
    );
    for (const sub of filteredSubmissions) {
      if (counts[sub.indicator_type] !== undefined) {
        counts[sub.indicator_type]++;
      }
    }
    return counts;
  }, [filteredSubmissions]);

  // Calculate chart data for Rekap Visualisasi (per indicator)
  const chartDataByIndicator = useMemo(() => {
    const submissionsByIndicator: Record<string, number> = {};
    
    // Filter submissions based on indicator filter
    const filteredByIndicator = indicatorFilter === 'all' 
      ? submissions 
      : submissions.filter(sub => sub.indicator_type === indicatorFilter);
    
    filteredByIndicator.forEach((sub) => {
      const indicator = sub.indicator_type;
      submissionsByIndicator[indicator] = (submissionsByIndicator[indicator] || 0) + 1;
    });

    const targetsByIndicator: Record<string, number> = {};
    targets.forEach((target) => {
      if (indicatorFilter === 'all' || target.indicator_type === indicatorFilter) {
        const existingTarget = targetsByIndicator[target.indicator_type] || 0;
        targetsByIndicator[target.indicator_type] = existingTarget + target.target_value;
      }
    });

    return INDICATOR_TYPES.map((indicatorType) => ({
      name: INDICATOR_TYPE_LABELS[indicatorType] || indicatorType,
      realisasi: submissionsByIndicator[indicatorType] || 0,
      target: targetsByIndicator[indicatorType] || 0,
    }));
  }, [submissions, targets, indicatorFilter]);

  // Calculate summary statistics for Rekap Visualisasi
  const totalRealisasiRecap = useMemo(() => {
    return chartDataByIndicator.reduce((sum, item) => sum + item.realisasi, 0);
  }, [chartDataByIndicator]);

  const totalTargetRecap = useMemo(() => {
    return chartDataByIndicator.reduce((sum, item) => sum + item.target, 0);
  }, [chartDataByIndicator]);

  const capaianPercentageRecap = useMemo(() => {
    if (totalTargetRecap === 0) return 0;
    return Math.round((totalRealisasiRecap / totalTargetRecap) * 100);
  }, [totalRealisasiRecap, totalTargetRecap]);

  // Reset filter to current month and year
  const handleResetFilter = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  // Month names for dropdown
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-pln-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (role !== 'uptuser') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="relative w-10 h-10">
                <Image 
                  src="/Logo_PLN.png" 
                  alt="Logo PLN" 
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Dashboard UPT</h1>
                <p className="text-sm text-gray-500">{uptName || 'UPT User'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="relative p-2 text-gray-500 hover:text-pln-blue hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showBellDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto animate-fadeIn">
                    <div className="bg-gray-50 border-b border-gray-200 p-4 rounded-t-xl">
                      <h3 className="font-semibold text-gray-800">Instruksi dari Admin</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
                      </p>
                    </div>

                    {isLoadingInstructions ? (
                      <div className="p-6 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-pln-blue border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : instructions.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-gray-500 text-sm">Belum ada instruksi</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {instructions.map((instruction) => {
                          const isRead = instructionReads.some((r) => r.instruction_id === instruction.$id);
                          return (
                            <button
                              key={instruction.$id}
                              onClick={() => handleViewInstruction(instruction)}
                              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                                isRead ? 'opacity-60' : 'bg-blue-50/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {!isRead && (
                                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      instruction.sub_category === 'INFLUENCER'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {instruction.sub_category}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-800 truncate">
                                    {instruction.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(instruction.published_at || instruction.$createdAt).toLocaleDateString('id-ID', {
                                      day: '2-digit',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification Banner */}
        {unreadCount > 0 && (
          <div className="bg-linear-to-r from-pln-blue to-blue-600 rounded-xl p-6 mb-8 shadow-lg animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Ada Instruksi Baru dari Admin!
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Terdapat <span className="font-bold text-white">{unreadCount}</span> instruksi yang belum dibaca untuk pengisian form indikator.
                </p>
                <div className="flex flex-wrap gap-2">
                  {unreadInstructions.slice(0, 3).map((instruction) => (
                    <button
                      key={instruction.$id}
                      onClick={() => handleViewInstruction(instruction)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {instruction.title}
                    </button>
                  ))}
                  {unreadCount > 3 && (
                    <button
                      onClick={() => setShowBellDropdown(true)}
                      className="bg-pln-yellow text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
                    >
                      +{unreadCount - 3} lainnya
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Card with Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pln-blue rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Laporan Saya</h2>
              <p className="text-sm text-gray-500">Ringkasan laporan per bulan</p>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pln-blue focus:border-pln-blue transition-colors"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pln-blue focus:border-pln-blue transition-colors"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Indicator Breakdown */}
          <div className="space-y-3">
            {isLoadingData ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-pln-blue border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-gray-500 text-sm">Memuat data...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">Tidak ada laporan untuk {monthNames[selectedMonth]} {selectedYear}</p>
              </div>
            ) : (
              <>
                {Object.entries(INDICATOR_TYPE_LABELS).map(([key, label]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-lg font-bold text-pln-blue">
                      {indicatorCounts[key] || 0}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 bg-pln-blue/10 rounded-lg border border-pln-blue/20">
                  <span className="text-sm font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-pln-blue">
                    {filteredSubmissions.length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Rekap Visualisasi Section */}
        {isLoadingData || isLoadingTargets ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mb-8">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-pln-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Memuat data visualisasi...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-pln-blue rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">Rekap Visualisasi</h2>
                <p className="text-sm text-gray-500">Perbandingan target dan realisasi {uptName}</p>
              </div>
              
              {/* Indicator Filter */}
              <div className="w-64">
                <select
                  value={indicatorFilter}
                  onChange={(e) => setIndicatorFilter(e.target.value)}
                  className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pln-blue focus:border-pln-blue transition-colors"
                >
                  <option value="all">Semua Indikator</option>
                  {INDICATOR_TYPES.map((type) => (
                    <option key={type} value={type}>{INDICATOR_TYPE_LABELS[type]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Realisasi Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-600">Realisasi</span>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-4xl font-bold text-blue-700">{totalRealisasiRecap}</p>
                <p className="text-xs text-blue-500 mt-1">Laporan selesai</p>
              </div>

              {/* Target Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-600">Target</span>
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-4xl font-bold text-purple-700">{totalTargetRecap}</p>
                <p className="text-xs text-purple-500 mt-1">Total target</p>
              </div>

              {/* Capaian Card with Dynamic Color */}
              <div className={`rounded-xl p-6 ${
                capaianPercentageRecap >= 81 
                  ? 'bg-green-50 border border-green-200'
                  : capaianPercentageRecap >= 41
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    capaianPercentageRecap >= 81
                      ? 'text-green-600'
                      : capaianPercentageRecap >= 41
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>Capaian</span>
                  <span className="text-2xl">🏆</span>
                </div>
                <p className={`text-4xl font-bold ${
                  capaianPercentageRecap >= 81
                    ? 'text-green-700'
                    : capaianPercentageRecap >= 41
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>{capaianPercentageRecap}%</p>
                <p className={`text-xs mt-1 ${
                  capaianPercentageRecap >= 81
                    ? 'text-green-500'
                    : capaianPercentageRecap >= 41
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}>Persentase tercapai</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Performa per Indikator</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartDataByIndicator}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    interval={0}
                    style={{ fontSize: '11px', fill: '#6B7280' }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    style={{ fontSize: '12px', fill: '#6B7280' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="target" fill="#C4B5FD" name="Target" opacity={0.6} />
                  <Bar dataKey="realisasi" name="Realisasi">
                    {chartDataByIndicator.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.realisasi >= entry.target ? '#10B981' : '#0072BC'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-pln-blue rounded"></div>
                  <span className="text-gray-600">Di bawah target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Target tercapai</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* New Submission Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pln-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Buat Laporan Baru</h3>
              <p className="text-gray-500 text-sm mb-6">Kirim laporan kinerja indikator baru</p>
              <Link
                href="/upt/submit-report"
                className="inline-flex items-center justify-center gap-2 bg-pln-blue hover:bg-pln-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Laporan
              </Link>
            </div>
          </div>

          {/* View History Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Riwayat Laporan</h3>
              <p className="text-gray-500 text-sm mb-6">Lihat semua laporan yang sudah dikirim</p>
              <Link
                href="/upt/history"
                className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Lihat Riwayat
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Panel */}
        <div className="bg-linear-to-br from-pln-blue to-blue-700 rounded-xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Selamat Datang di {uptName || 'UPT'}
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Anda terhubung ke Sistem Pelaporan Kinerja UPT PLN. 
              Kirimkan laporan indikator kinerja Anda dan pantau kontribusi untuk PLN Indonesia.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Sistem Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Database Tersinkronisasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 PLN Indonesia. Sistem Pelaporan Kinerja UPT.
          </p>
        </div>
      </main>

      {/* Instruction Detail Modal */}
      <InstructionDetailModal
        instruction={selectedInstruction}
        isOpen={showInstructionModal}
        onClose={() => setShowInstructionModal(false)}
        currentUserId={user?.$id || ''}
        currentUptName={uptName || ''}
        onMarkAsRead={handleRefreshReadStatus}
      />
    </div>
  );
}
