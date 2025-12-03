'use client';

import { useAuth } from '@/contexts/AuthContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { databases } from '@/lib/appwrite';
import { APPWRITE_CONFIG, INDICATOR_TYPES, UPT_NAMES, INDICATOR_TYPE_LABELS, SUB_CATEGORY_LABELS } from '@/lib/constants';
import { Query } from 'appwrite';
import type { Submission, Instruction, Target } from '@/types';
import Image from 'next/image';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import CreateInstructionModal from '@/components/CreateInstructionModal';
import ManageTargetsModal from '@/components/ManageTargetsModal';

export default function AdminDashboardPage() {
  const { user, role, isLoading, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);
  const [isLoadingTargets, setIsLoadingTargets] = useState(true);
  
  // Modal state
  const [showCreateInstruction, setShowCreateInstruction] = useState(false);
  const [showManageTargets, setShowManageTargets] = useState(false);
  
  // UI state
  const [showDataTable, setShowDataTable] = useState(false);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([{ id: 'submission_date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Filter state
  const [uptFilter, setUptFilter] = useState<string>('all');
  const [indicatorFilter, setIndicatorFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Verify admin role - redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        window.location.href = '/login?redirect=/admin';
      } else if (role !== 'admin') {
        // Authenticated but not admin, redirect to home
        window.location.href = '/';
      }
    }
  }, [user, role, isLoading]);

  // Fetch ALL submissions (admin can see everything)
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (role !== 'admin') return;

      try {
        setIsLoadingData(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.SUBMISSIONS,
          [Query.orderDesc('$createdAt'), Query.limit(1000)]
        );

        setSubmissions(response.documents as unknown as Submission[]);
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (role === 'admin') {
      fetchSubmissions();
    }
  }, [role]);

  // Fetch ALL instructions
  useEffect(() => {
    const fetchInstructions = async () => {
      if (role !== 'admin') return;

      try {
        setIsLoadingInstructions(true);
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
          [Query.orderDesc('$createdAt'), Query.limit(100)]
        );

        setInstructions(response.documents as unknown as Instruction[]);
      } catch (error) {
        console.error('Failed to fetch instructions:', error);
      } finally {
        setIsLoadingInstructions(false);
      }
    };

    if (role === 'admin') {
      fetchInstructions();
    }
  }, [role]);

  // Fetch ALL targets
  useEffect(() => {
    const fetchTargets = async () => {
      if (role !== 'admin') return;

      try {
        setIsLoadingTargets(true);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentSemester = currentMonth <= 6 ? 1 : 2;

        const response = await databases.listDocuments(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.TARGETS,
          [
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

    if (role === 'admin') {
      fetchTargets();
    }
  }, [role]);

  // Refresh targets after update
  const handleTargetsSuccess = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const currentSemester = currentMonth <= 6 ? 1 : 2;

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.TARGETS,
        [
          Query.equal('year', currentYear),
          Query.equal('semester', currentSemester),
          Query.limit(1000)
        ]
      );
      setTargets(response.documents as unknown as Target[]);
    } catch (error) {
      console.error('Failed to refresh targets:', error);
    }
  };

  // Refresh instructions after create/update
  const handleInstructionSuccess = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        [Query.orderDesc('$createdAt'), Query.limit(100)]
      );
      setInstructions(response.documents as unknown as Instruction[]);
    } catch (error) {
      console.error('Failed to refresh instructions:', error);
    }
  };

  // Delete instruction
  const handleDeleteInstruction = async (instructionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus instruksi ini?')) {
      return;
    }

    try {
      await databases.deleteDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        instructionId
      );
      await handleInstructionSuccess();
    } catch (error) {
      console.error('Failed to delete instruction:', error);
      alert('Gagal menghapus instruksi');
    }
  };

  // Publish draft instruction
  const handlePublishInstruction = async (instructionId: string) => {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTIONS,
        instructionId,
        {
          status: 'PUBLISHED',
          published_at: new Date().toISOString()
        }
      );
      await handleInstructionSuccess();
    } catch (error) {
      console.error('Failed to publish instruction:', error);
      alert('Gagal mempublish instruksi');
    }
  };

  // Apply custom filters to data
  const filteredData = useMemo(() => {
    let filtered = submissions;

    if (uptFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.submitted_by_upt === uptFilter);
    }

    if (indicatorFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.indicator_type === indicatorFilter);
    }

    if (dateFrom) {
      filtered = filtered.filter((sub) => {
        const subDate = new Date(sub.submission_date);
        return subDate >= new Date(dateFrom);
      });
    }

    if (dateTo) {
      filtered = filtered.filter((sub) => {
        const subDate = new Date(sub.submission_date);
        return subDate <= new Date(dateTo);
      });
    }

    return filtered;
  }, [submissions, uptFilter, indicatorFilter, dateFrom, dateTo]);

  // Calculate chart data for visualization
  const chartData = useMemo(() => {
    const submissionsByUPT: Record<string, number> = {};
    filteredData.forEach((sub) => {
      const uptName = sub.submitted_by_upt;
      submissionsByUPT[uptName] = (submissionsByUPT[uptName] || 0) + 1;
    });

    const targetsByUPT: Record<string, number> = {};
    targets.forEach((target) => {
      if (indicatorFilter === 'all' || target.indicator_type === indicatorFilter) {
        const existingTarget = targetsByUPT[target.upt_name] || 0;
        targetsByUPT[target.upt_name] = existingTarget + target.target_value;
      }
    });

    return UPT_NAMES.map((uptName) => ({
      name: uptName.replace('UPT ', ''),
      realisasi: submissionsByUPT[uptName] || 0,
      target: targetsByUPT[uptName] || 0,
    }));
  }, [filteredData, targets, indicatorFilter]);

  // Calculate summary statistics
  const totalRealisasi = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.realisasi, 0);
  }, [chartData]);

  const totalTarget = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.target, 0);
  }, [chartData]);

  const capaianPercentage = useMemo(() => {
    if (totalTarget === 0) return 0;
    return Math.round((totalRealisasi / totalTarget) * 100);
  }, [totalRealisasi, totalTarget]);

  // Calculate stats
  const totalSubmissions = submissions.length;
  const activeUPTs = useMemo(() => {
    const uniqueUPTs = new Set(submissions.map((sub) => sub.submitted_by_upt));
    return uniqueUPTs.size;
  }, [submissions]);

  const thisMonthSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const submissionDate = new Date(sub.submission_date);
      const now = new Date();
      return (
        submissionDate.getMonth() === now.getMonth() &&
        submissionDate.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [submissions]);

  // Table columns
  const columnHelper = createColumnHelper<Submission>();
  
  const columns = useMemo(
    () => [
      columnHelper.accessor('submission_date', {
        header: 'Tanggal',
        cell: (info) => {
          const date = new Date(info.getValue());
          return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        },
      }),
      columnHelper.accessor('submitted_by_upt', {
        header: 'UPT',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('indicator_type', {
        header: 'Indikator',
        cell: (info) => INDICATOR_TYPE_LABELS[info.getValue()] || info.getValue(),
      }),
      columnHelper.accessor('sub_category', {
        header: 'Sub-Kategori',
        cell: (info) => {
          const value = info.getValue();
          return value ? SUB_CATEGORY_LABELS[value] || value : '—';
        },
      }),
      columnHelper.accessor('title', {
        header: 'Judul',
        cell: (info) => (
          <div className="max-w-md truncate" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('documentation_link', {
        header: 'Dokumentasi',
        cell: (info) => {
          const link = info.getValue();
          return link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pln-blue hover:text-pln-blue-dark transition-colors underline"
            >
              Lihat
            </a>
          ) : (
            <span className="text-gray-400">—</span>
          );
        },
      }),
    ],
    [columnHelper]
  );

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Export to Excel function
  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const excelData = filteredData.map((sub) => {
      // Base fields (always included)
      const baseData: Record<string, unknown> = {
        Tanggal: new Date(sub.submission_date).toLocaleDateString('id-ID'),
        UPT: sub.submitted_by_upt,
        'Tipe Indikator': INDICATOR_TYPE_LABELS[sub.indicator_type] || sub.indicator_type,
      };

      // Add sub-category if exists
      if (sub.sub_category) {
        baseData['Sub-Kategori'] = SUB_CATEGORY_LABELS[sub.sub_category] || sub.sub_category;
      }

      // Check indicator type and add appropriate fields
      if (sub.indicator_type === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL') {
        // Skoring Media fields
        if (sub.sub_category === 'MEDIA MASSA' && sub.skor_media_massa !== null) {
          baseData['Skor Media Massa'] = sub.skor_media_massa;
        }
        if (sub.sub_category === 'MEDIA SOSIAL' && sub.skor_media_sosial !== null) {
          baseData['Skor Media Sosial'] = sub.skor_media_sosial;
        }
      } else if (sub.indicator_type === 'INFLUENCER DAN SMR') {
        // Influencer/SMR fields
        baseData['Nomor Konten'] = sub.nomor_konten || '';
        baseData['Judul'] = sub.title || '';

        // Add social media links based on sub-category
        if (sub.sub_category === 'INFLUENCER') {
          // Instagram (2 accounts)
          if (sub.link_instagram_1) {
            baseData['Instagram 1 - Link'] = sub.link_instagram_1;
            baseData['Instagram 1 - Username'] = sub.username_instagram_1 || '';
          }
          if (sub.link_instagram_2) {
            baseData['Instagram 2 - Link'] = sub.link_instagram_2;
            baseData['Instagram 2 - Username'] = sub.username_instagram_2 || '';
          }
          
          // Twitter (2 accounts)
          if (sub.link_twitter_1) {
            baseData['Twitter 1 - Link'] = sub.link_twitter_1;
            baseData['Twitter 1 - Username'] = sub.username_twitter_1 || '';
          }
          if (sub.link_twitter_2) {
            baseData['Twitter 2 - Link'] = sub.link_twitter_2;
            baseData['Twitter 2 - Username'] = sub.username_twitter_2 || '';
          }
          
          // YouTube (2 channels)
          if (sub.link_youtube_1) {
            baseData['YouTube 1 - Link'] = sub.link_youtube_1;
            baseData['YouTube 1 - Channel'] = sub.username_youtube_1 || '';
          }
          if (sub.link_youtube_2) {
            baseData['YouTube 2 - Link'] = sub.link_youtube_2;
            baseData['YouTube 2 - Channel'] = sub.username_youtube_2 || '';
          }
          
          // TikTok (1 account)
          if (sub.link_tiktok) {
            baseData['TikTok - Link'] = sub.link_tiktok;
            baseData['TikTok - Username'] = sub.username_tiktok || '';
          }
        } else if (sub.sub_category === 'SMR') {
          // Instagram (1 account)
          if (sub.link_instagram_1) {
            baseData['Instagram - Link'] = sub.link_instagram_1;
            baseData['Instagram - Username'] = sub.username_instagram_1 || '';
          }
          
          // Facebook (1 account)
          if (sub.link_facebook) {
            baseData['Facebook - Link'] = sub.link_facebook;
            baseData['Facebook - Username'] = sub.username_facebook || '';
          }
          
          // Twitter (1 account)
          if (sub.link_twitter_1) {
            baseData['Twitter - Link'] = sub.link_twitter_1;
            baseData['Twitter - Username'] = sub.username_twitter_1 || '';
          }
        }
      } else {
        // Standard fields for other indicator types
        baseData['Judul'] = sub.title || '';
        
        // Check if it's KONTEN IN-CHANGE or KONTEN WAG (uses link_media)
        if (sub.indicator_type === 'KONTEN IN-CHANGE' || sub.indicator_type === 'KONTEN WAG') {
          baseData['Link Media'] = sub.link_media || '';
        } else {
          // Other indicators use narasi and documentation_link
          baseData['Narasi'] = sub.narasi || '';
          baseData['Link Dokumentasi'] = sub.documentation_link || '';
        }
      }

      return baseData;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Laporan_UPT_${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

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

  if (role !== 'admin') {
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
                <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
                <p className="text-sm text-gray-500">Sistem Pelaporan Kinerja UPT</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Submissions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Laporan</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoadingData ? '...' : totalSubmissions}
                </p>
                <p className="text-xs text-gray-400 mt-1">Dari semua UPT</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-pln-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active UPTs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">UPT Aktif</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoadingData ? '...' : activeUPTs}
                </p>
                <p className="text-xs text-gray-400 mt-1">Sudah mengirim laporan</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Bulan Ini</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {isLoadingData ? '...' : thisMonthSubmissions}
                </p>
                <p className="text-xs text-gray-400 mt-1">Laporan baru</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pln-blue rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Manajemen Instruksi</h2>
                <p className="text-sm text-gray-500">Kelola instruksi untuk UPT</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowManageTargets(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Kelola Target
              </button>
              <button
                onClick={() => setShowCreateInstruction(true)}
                className="bg-pln-blue hover:bg-pln-blue-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Instruksi
              </button>
            </div>
          </div>

          {/* Instructions Table */}
          {isLoadingInstructions ? (
            <div className="text-center py-12">
              <div className="inline-block w-10 h-10 border-4 border-pln-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Memuat instruksi...</p>
            </div>
          ) : instructions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Belum Ada Instruksi</h3>
              <p className="text-gray-500 text-sm">Klik tombol &quot;Buat Instruksi&quot; untuk membuat instruksi baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Sub-Kategori</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Target</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Judul</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Google Drive</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tanggal</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {instructions.map((instruction, index) => (
                    <tr
                      key={instruction.$id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          instruction.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {instruction.status === 'PUBLISHED' ? 'Dipublikasi' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{instruction.sub_category}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {instruction.target_type === 'ALL' ? (
                          <span className="text-pln-blue">Semua UPT</span>
                        ) : (
                          <span className="text-purple-600">{instruction.target_upt?.length || 0} UPT</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700 max-w-xs truncate" title={instruction.title}>
                        {instruction.title}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {instruction.content_link ? (
                          <a
                            href={instruction.content_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pln-blue hover:text-pln-blue-dark transition-colors underline"
                          >
                            Lihat
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(instruction.$createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {instruction.status === 'DRAFT' && (
                            <button
                              onClick={() => handlePublishInstruction(instruction.$id)}
                              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              Publikasi
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInstruction(instruction.$id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Instruction Modal */}
        <CreateInstructionModal
          isOpen={showCreateInstruction}
          onClose={() => setShowCreateInstruction(false)}
          onSuccess={handleInstructionSuccess}
          adminUserId={user?.$id || ''}
          adminName={user?.name || 'Admin'}
        />

        {/* Manage Targets Modal */}
        <ManageTargetsModal
          isOpen={showManageTargets}
          onClose={() => setShowManageTargets(false)}
          onSuccess={handleTargetsSuccess}
        />

        {/* Filter Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Filter Data</h2>
              <p className="text-sm text-gray-500">Saring data berdasarkan kriteria</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* UPT Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">UPT</label>
              <select
                value={uptFilter}
                onChange={(e) => setUptFilter(e.target.value)}
                className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pln-blue focus:border-pln-blue transition-colors"
              >
                <option value="all">Semua UPT</option>
                {UPT_NAMES.map((upt) => (
                  <option key={upt} value={upt}>{upt}</option>
                ))}
              </select>
            </div>

            {/* Indicator Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Indikator</label>
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

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pln-blue focus:border-pln-blue transition-colors"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 text-gray-700 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pln-blue focus:border-pln-blue transition-colors"
              />
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-pln-blue">{filteredData.length}</span> dari{' '}
              <span className="font-semibold text-pln-blue">{totalSubmissions}</span> laporan
            </p>
          </div>
        </div>

        {/* Recap Visualization Section */}
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
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Rekap Visualisasi</h2>
                <p className="text-sm text-gray-500">Perbandingan target dan realisasi</p>
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
                <p className="text-4xl font-bold text-blue-700">{totalRealisasi}</p>
                <p className="text-xs text-blue-500 mt-1">Laporan selesai</p>
              </div>

              {/* Target Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-600">Target</span>
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-4xl font-bold text-purple-700">{totalTarget}</p>
                <p className="text-xs text-purple-500 mt-1">Total target</p>
              </div>

              {/* Capaian Card */}
              <div className={`rounded-xl p-6 ${
                capaianPercentage >= 81 
                  ? 'bg-green-50 border border-green-200'
                  : capaianPercentage >= 41
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    capaianPercentage >= 81
                      ? 'text-green-600'
                      : capaianPercentage >= 41
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>Capaian</span>
                  <span className="text-2xl">🏆</span>
                </div>
                <p className={`text-4xl font-bold ${
                  capaianPercentage >= 81
                    ? 'text-green-700'
                    : capaianPercentage >= 41
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>{capaianPercentage}%</p>
                <p className={`text-xs mt-1 ${
                  capaianPercentage >= 81
                    ? 'text-green-500'
                    : capaianPercentage >= 41
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}>Persentase tercapai</p>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-md font-semibold text-gray-700 mb-4">Performa per UPT</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    style={{ fontSize: '12px', fill: '#6B7280' }}
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
                    {chartData.map((entry, index) => (
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

        {/* Toggle Button for Data Table */}
        <div className="mb-6">
          <button
            onClick={() => setShowDataTable(!showDataTable)}
            className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium
                       shadow-sm hover:shadow-md hover:bg-gray-50
                       transition-all flex items-center justify-center gap-3"
          >
            <svg className={`w-5 h-5 transition-transform ${showDataTable ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showDataTable ? 'Sembunyikan Tabel Data' : 'Tampilkan Tabel Data Detail'}
          </button>
        </div>

        {/* Loading State */}
        {isLoadingData && showDataTable && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-pln-blue border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Memuat data laporan...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingData && submissions.length === 0 && showDataTable && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Belum Ada Laporan</h3>
              <p className="text-gray-500 text-sm">Menunggu UPT mengirimkan laporan pertama...</p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoadingData && submissions.length > 0 && showDataTable && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-lg font-semibold text-gray-800">Database Semua Laporan</h2>
                <button
                  onClick={handleExportExcel}
                  disabled={filteredData.length === 0}
                  className="bg-pln-blue hover:bg-pln-blue-dark text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Excel
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} className="border-b border-gray-200 bg-gray-50">
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="text-left py-3 px-4 text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' && <span className="text-pln-blue">↑</span>}
                            {header.column.getIsSorted() === 'desc' && <span className="text-pln-blue">↓</span>}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center">
                        <p className="text-gray-500">Tidak ada data yang sesuai dengan filter</p>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row, index) => (
                      <tr
                        key={row.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="py-3 px-4 text-sm text-gray-700">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Total data ditampilkan: <span className="font-semibold text-pln-blue">{table.getRowModel().rows.length}</span>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 PLN Indonesia. Sistem Pelaporan Kinerja UPT.
          </p>
        </div>
      </main>
    </div>
  );
}
