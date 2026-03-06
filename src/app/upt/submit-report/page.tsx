'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, storage, ID } from '@/lib/appwrite';
import { 
  APPWRITE_CONFIG, 
  INDICATOR_TYPES, 
  SKORING_MEDIA_SUB_CATEGORIES,
  VALIDATION_RULES, 
  MESSAGES 
} from '@/lib/constants';
import type { IndicatorType, SkoringMediaSubCategory } from '@/types';
import * as XLSX from 'xlsx';

export default function SubmitReportPage() {
  const { user, uptName, isLoading, role } = useAuth();
  const router = useRouter();

  // Form state
  const [indicatorType, setIndicatorType] = useState<IndicatorType | ''>('');
  const [subCategory, setSubCategory] = useState<'INFLUENCER' | SkoringMediaSubCategory | ''>('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [title, setTitle] = useState('');
  const [narasi, setNarasi] = useState('');
  const [documentationLink, setDocumentationLink] = useState('');
  const [linkMedia, setLinkMedia] = useState('');
  
  // Skoring Media Massa state
  const [linkPublikasi, setLinkPublikasi] = useState('');
  const [namaMedia, setNamaMedia] = useState('');
  
  // Skoring Media Sosial state (file upload)
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [parsedTotalScore, setParsedTotalScore] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  // Legacy Skoring Media state (kept for compatibility)
  
  // Influencer common state
  const [nomorKonten, setNomorKonten] = useState('');
  
  // Influencer state (Instagram Feed - 3 fields)
  const [linkInstagram1, setLinkInstagram1] = useState('');
  const [usernameInstagram1, setUsernameInstagram1] = useState('');
  const [linkInstagram2, setLinkInstagram2] = useState('');
  const [usernameInstagram2, setUsernameInstagram2] = useState('');
  const [linkInstagram3, setLinkInstagram3] = useState('');
  const [usernameInstagram3, setUsernameInstagram3] = useState('');
  
  // Influencer state (Instagram Reels - 3 fields)
  const [linkIgReels1, setLinkIgReels1] = useState('');
  const [usernameIgReels1, setUsernameIgReels1] = useState('');
  const [linkIgReels2, setLinkIgReels2] = useState('');
  const [usernameIgReels2, setUsernameIgReels2] = useState('');
  const [linkIgReels3, setLinkIgReels3] = useState('');
  const [usernameIgReels3, setUsernameIgReels3] = useState('');
  
  // Influencer state (Twitter/X - 3 fields)
  const [linkTwitter1, setLinkTwitter1] = useState('');
  const [usernameTwitter1, setUsernameTwitter1] = useState('');
  const [linkTwitter2, setLinkTwitter2] = useState('');
  const [usernameTwitter2, setUsernameTwitter2] = useState('');
  const [linkTwitter3, setLinkTwitter3] = useState('');
  const [usernameTwitter3, setUsernameTwitter3] = useState('');
  
  // Influencer state (Facebook - 1 field)
  const [linkFacebook, setLinkFacebook] = useState('');
  const [usernameFacebook, setUsernameFacebook] = useState('');
  
  // Influencer state (Threads - 3 fields)
  const [linkThreads1, setLinkThreads1] = useState('');
  const [usernameThreads1, setUsernameThreads1] = useState('');
  const [linkThreads2, setLinkThreads2] = useState('');
  const [usernameThreads2, setUsernameThreads2] = useState('');
  const [linkThreads3, setLinkThreads3] = useState('');
  const [usernameThreads3, setUsernameThreads3] = useState('');
  
  // Influencer state (YouTube Short - 3 fields)
  const [linkYoutube1, setLinkYoutube1] = useState('');
  const [usernameYoutube1, setUsernameYoutube1] = useState('');
  const [linkYoutube2, setLinkYoutube2] = useState('');
  const [usernameYoutube2, setUsernameYoutube2] = useState('');
  const [linkYoutube3, setLinkYoutube3] = useState('');
  const [usernameYoutube3, setUsernameYoutube3] = useState('');
  
  // Influencer state (YouTube Video - 3 fields)
  const [linkYtVideo1, setLinkYtVideo1] = useState('');
  const [usernameYtVideo1, setUsernameYtVideo1] = useState('');
  const [linkYtVideo2, setLinkYtVideo2] = useState('');
  const [usernameYtVideo2, setUsernameYtVideo2] = useState('');
  const [linkYtVideo3, setLinkYtVideo3] = useState('');
  const [usernameYtVideo3, setUsernameYtVideo3] = useState('');
  
  // Influencer state (TikTok - 2 fields)
  const [linkTiktok, setLinkTiktok] = useState('');
  const [usernameTiktok, setUsernameTiktok] = useState('');
  const [linkTiktok2, setLinkTiktok2] = useState('');
  const [usernameTiktok2, setUsernameTiktok2] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSkoringBlockedModal, setShowSkoringBlockedModal] = useState(false);

  const isDateBlocked = () => {
    const today = new Date();
    const day = today.getDate();
    return day === 17 || day === 18;
  };

  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed
    if (month === 0) {
      return `${year}-01-01`;
    }
    const prevMonth = String(month).padStart(2, '0');
    return `${year}-${prevMonth}-19`;
  };

  // Check if sub-category should be shown
  const showSkoringMediaSubCategory = indicatorType === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL';
  
  // Check which form fields to show
  const isSkoringMedia = indicatorType === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL';
  const showSkorMediaMassa = isSkoringMedia && subCategory === 'MEDIA MASSA';
  const showSkorMediaSosial = isSkoringMedia && subCategory === 'MEDIA SOSIAL';
  
  const isInfluencer = indicatorType === 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT';
  
  // KONTEN VIDEO IN-CHANGE and PENGELOLAAN KOMUNIKASI INTERNAL use link_media instead of narasi + documentation_link
  const isKontenInChange = indicatorType === 'KONTEN VIDEO IN-CHANGE';
  const isKontenWAG = indicatorType === 'PENGELOLAAN KOMUNIKASI INTERNAL';
  const showLinkMedia = isKontenInChange || isKontenWAG;
  
  const showStandardFields = !isSkoringMedia && !isInfluencer && !showLinkMedia;

  // Redirect if not UPT user
  if (!isLoading && role !== 'uptuser') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!user) {
      setError('Pengguna tidak terautentikasi');
      return;
    }

    if (!uptName) {
      setError('Nama UPT tidak ditemukan');
      return;
    }

    // Validate username fields - should not contain URLs
    const urlPattern = /https?:\/\//i;
    const usernameFields = [
      { value: usernameInstagram1, name: 'Username Instagram Feed 1' },
      { value: usernameInstagram2, name: 'Username Instagram Feed 2' },
      { value: usernameInstagram3, name: 'Username Instagram Feed 3' },
      { value: usernameIgReels1, name: 'Username Instagram Reels 1' },
      { value: usernameIgReels2, name: 'Username Instagram Reels 2' },
      { value: usernameIgReels3, name: 'Username Instagram Reels 3' },
      { value: usernameTwitter1, name: 'Username Twitter 1' },
      { value: usernameTwitter2, name: 'Username Twitter 2' },
      { value: usernameTwitter3, name: 'Username Twitter 3' },
      { value: usernameFacebook, name: 'Username/Page Facebook' },
      { value: usernameThreads1, name: 'Username Threads 1' },
      { value: usernameThreads2, name: 'Username Threads 2' },
      { value: usernameThreads3, name: 'Username Threads 3' },
      { value: usernameYoutube1, name: 'Username/Channel YouTube Short 1' },
      { value: usernameYoutube2, name: 'Username/Channel YouTube Short 2' },
      { value: usernameYoutube3, name: 'Username/Channel YouTube Short 3' },
      { value: usernameYtVideo1, name: 'Username/Channel YouTube Video 1' },
      { value: usernameYtVideo2, name: 'Username/Channel YouTube Video 2' },
      { value: usernameYtVideo3, name: 'Username/Channel YouTube Video 3' },
      { value: usernameTiktok, name: 'Username TikTok 1' },
      { value: usernameTiktok2, name: 'Username TikTok 2' },
    ];

    for (const field of usernameFields) {
      if (field.value && urlPattern.test(field.value)) {
        alert(`❌ ${field.name} tidak boleh mengandung URL (http:// atau https://).\n\nSilakan masukkan username saja.`);
        return;
      }
    }

    // Validate based on indicator type
    if (isSkoringMedia) {
      if (!subCategory) {
        setError('Silakan pilih sub-kategori (Media Massa atau Media Sosial)');
        return;
      }

      if (subCategory === 'MEDIA MASSA') {
        if (!title || title.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
          setError(`Judul minimal ${VALIDATION_RULES.TITLE.MIN_LENGTH} karakter`);
          return;
        }
        if (!linkPublikasi || !VALIDATION_RULES.DOCUMENTATION_LINK.PATTERN.test(linkPublikasi)) {
          setError('Link Publikasi harus berupa URL yang valid (dimulai dengan http:// atau https://)');
          return;
        }
        if (!namaMedia || namaMedia.trim().length === 0) {
          setError('Nama Media wajib diisi');
          return;
        }
      }

      if (subCategory === 'MEDIA SOSIAL') {
        if (!excelFile) {
          setError('Silakan upload file Excel template yang sudah diisi');
          return;
        }
        if (parsedTotalScore === null || parsedTotalScore <= 0) {
          setError('Total Score tidak ditemukan atau tidak valid dalam file Excel. Pastikan file yang di-upload sudah benar.');
          return;
        }
      }
    } else if (isInfluencer) {
      if (!nomorKonten || nomorKonten.trim().length === 0) {
        setError('Silakan masukkan Nomor Konten');
        return;
      }

      if (!title || title.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        setError(`Judul minimal ${VALIDATION_RULES.TITLE.MIN_LENGTH} karakter`);
        return;
      }

      // Validate all platforms are filled
      if (!linkInstagram1) { setError('Link Instagram Feed 1 wajib diisi'); return; }
      if (!linkInstagram2) { setError('Link Instagram Feed 2 wajib diisi'); return; }
      if (!linkInstagram3) { setError('Link Instagram Feed 3 wajib diisi'); return; }
      if (!linkIgReels1) { setError('Link Instagram Reels 1 wajib diisi'); return; }
      if (!linkIgReels2) { setError('Link Instagram Reels 2 wajib diisi'); return; }
      if (!linkIgReels3) { setError('Link Instagram Reels 3 wajib diisi'); return; }
      if (!linkTwitter1) { setError('Link Twitter/X 1 wajib diisi'); return; }
      if (!linkTwitter2) { setError('Link Twitter/X 2 wajib diisi'); return; }
      if (!linkTwitter3) { setError('Link Twitter/X 3 wajib diisi'); return; }
      if (!linkFacebook) { setError('Link Facebook wajib diisi'); return; }
      if (!linkThreads1) { setError('Link Threads 1 wajib diisi'); return; }
      if (!linkThreads2) { setError('Link Threads 2 wajib diisi'); return; }
      if (!linkThreads3) { setError('Link Threads 3 wajib diisi'); return; }
      if (!linkYoutube1) { setError('Link YouTube Short 1 wajib diisi'); return; }
      if (!linkYoutube2) { setError('Link YouTube Short 2 wajib diisi'); return; }
      if (!linkYoutube3) { setError('Link YouTube Short 3 wajib diisi'); return; }
      if (!linkYtVideo1) { setError('Link YouTube Video 1 wajib diisi'); return; }
      if (!linkYtVideo2) { setError('Link YouTube Video 2 wajib diisi'); return; }
      if (!linkYtVideo3) { setError('Link YouTube Video 3 wajib diisi'); return; }
      if (!linkTiktok) { setError('Link TikTok 1 wajib diisi'); return; }
      if (!linkTiktok2) { setError('Link TikTok 2 wajib diisi'); return; }
    } else if (showLinkMedia) {
      // Validation for KONTEN VIDEO IN-CHANGE and PENGELOLAAN KOMUNIKASI INTERNAL
      if (title.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        setError(`Judul minimal ${VALIDATION_RULES.TITLE.MIN_LENGTH} karakter`);
        return;
      }

      if (!VALIDATION_RULES.DOCUMENTATION_LINK.PATTERN.test(linkMedia)) {
        setError('Link Media harus berupa URL yang valid (dimulai dengan http:// atau https://)');
        return;
      }
    } else {
      if (title.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        setError(`Judul minimal ${VALIDATION_RULES.TITLE.MIN_LENGTH} karakter`);
        return;
      }

      if (narasi.length < VALIDATION_RULES.NARASI.MIN_LENGTH) {
        setError(`Narasi minimal ${VALIDATION_RULES.NARASI.MIN_LENGTH} karakter`);
        return;
      }

      if (!VALIDATION_RULES.DOCUMENTATION_LINK.PATTERN.test(documentationLink)) {
        setError(MESSAGES.ERROR.INVALID_URL);
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Prepare submission data
      const submissionData: Record<string, unknown> = {
        indicator_type: indicatorType,
        submitted_by_upt: uptName,
        submission_date: new Date(submissionDate).toISOString(),
        submitted_by_user: user.$id,
      };

      // Add fields based on indicator type
      if (isSkoringMedia) {
        submissionData.sub_category = subCategory;
        if (subCategory === 'MEDIA MASSA') {
          submissionData.title = title.trim();
          submissionData.link_publikasi = linkPublikasi.trim();
          submissionData.nama_media = namaMedia.trim();
          submissionData.skor_media_massa = null;
          submissionData.skor_media_sosial = null;
          submissionData.file_id = null;
        } else if (subCategory === 'MEDIA SOSIAL') {
          // Upload file to Appwrite Storage
          setUploadProgress('Mengupload file...');
          const uploadedFile = await storage.createFile(
            APPWRITE_CONFIG.STORAGE.SKORING_MEDIA_FILES,
            ID.unique(),
            excelFile!
          );
          setUploadProgress('File berhasil diupload!');
          
          submissionData.skor_media_sosial = parsedTotalScore;
          submissionData.skor_media_massa = null;
          submissionData.file_id = uploadedFile.$id;
          submissionData.title = null;
          submissionData.link_publikasi = null;
          submissionData.nama_media = null;
        }
        submissionData.narasi = null;
        submissionData.documentation_link = null;
      } else if (isInfluencer) {
        submissionData.sub_category = 'INFLUENCER';
        submissionData.nomor_konten = nomorKonten.trim();
        submissionData.title = title.trim();
        submissionData.narasi = null;
        submissionData.documentation_link = null;
        // Instagram Feed
        submissionData.link_instagram_1 = linkInstagram1.trim() || null;
        submissionData.username_instagram_1 = usernameInstagram1.trim() || null;
        submissionData.link_instagram_2 = linkInstagram2.trim() || null;
        submissionData.username_instagram_2 = usernameInstagram2.trim() || null;
        submissionData.link_instagram_3 = linkInstagram3.trim() || null;
        submissionData.username_instagram_3 = usernameInstagram3.trim() || null;
        // Instagram Reels
        submissionData.link_ig_reels_1 = linkIgReels1.trim() || null;
        submissionData.username_ig_reels_1 = usernameIgReels1.trim() || null;
        submissionData.link_ig_reels_2 = linkIgReels2.trim() || null;
        submissionData.username_ig_reels_2 = usernameIgReels2.trim() || null;
        submissionData.link_ig_reels_3 = linkIgReels3.trim() || null;
        submissionData.username_ig_reels_3 = usernameIgReels3.trim() || null;
        // Twitter/X
        submissionData.link_twitter_1 = linkTwitter1.trim() || null;
        submissionData.username_twitter_1 = usernameTwitter1.trim() || null;
        submissionData.link_twitter_2 = linkTwitter2.trim() || null;
        submissionData.username_twitter_2 = usernameTwitter2.trim() || null;
        submissionData.link_twitter_3 = linkTwitter3.trim() || null;
        submissionData.username_twitter_3 = usernameTwitter3.trim() || null;
        // Facebook
        submissionData.link_facebook = linkFacebook.trim() || null;
        submissionData.username_facebook = usernameFacebook.trim() || null;
        // Threads
        submissionData.link_threads_1 = linkThreads1.trim() || null;
        submissionData.username_threads_1 = usernameThreads1.trim() || null;
        submissionData.link_threads_2 = linkThreads2.trim() || null;
        submissionData.username_threads_2 = usernameThreads2.trim() || null;
        submissionData.link_threads_3 = linkThreads3.trim() || null;
        submissionData.username_threads_3 = usernameThreads3.trim() || null;
        // YouTube Short
        submissionData.link_youtube_1 = linkYoutube1.trim() || null;
        submissionData.username_youtube_1 = usernameYoutube1.trim() || null;
        submissionData.link_youtube_2 = linkYoutube2.trim() || null;
        submissionData.username_youtube_2 = usernameYoutube2.trim() || null;
        submissionData.link_youtube_3 = linkYoutube3.trim() || null;
        submissionData.username_youtube_3 = usernameYoutube3.trim() || null;
        // YouTube Video
        submissionData.link_yt_video_1 = linkYtVideo1.trim() || null;
        submissionData.username_yt_video_1 = usernameYtVideo1.trim() || null;
        submissionData.link_yt_video_2 = linkYtVideo2.trim() || null;
        submissionData.username_yt_video_2 = usernameYtVideo2.trim() || null;
        submissionData.link_yt_video_3 = linkYtVideo3.trim() || null;
        submissionData.username_yt_video_3 = usernameYtVideo3.trim() || null;
        // TikTok
        submissionData.link_tiktok = linkTiktok.trim() || null;
        submissionData.username_tiktok = usernameTiktok.trim() || null;
        submissionData.link_tiktok_2 = linkTiktok2.trim() || null;
        submissionData.username_tiktok_2 = usernameTiktok2.trim() || null;
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else {
        submissionData.sub_category = null;
        submissionData.title = title.trim();
        submissionData.narasi = narasi.trim();
        submissionData.documentation_link = documentationLink.trim();
        submissionData.link_media = null;
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      }

      // Create document in Appwrite
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.SUBMISSIONS,
        ID.unique(),
        submissionData
      );

      // Success!
      setSuccess(true);
      
      // Reset form
      setIndicatorType('');
      setSubCategory('');
      setSubmissionDate('');
      setTitle('');
      setNarasi('');
      setDocumentationLink('');
      setLinkMedia('');

      setLinkPublikasi('');
      setNamaMedia('');
      setExcelFile(null);
      setParsedTotalScore(null);
      setUploadProgress('');
      setNomorKonten('');
      setLinkInstagram1(''); setUsernameInstagram1('');
      setLinkInstagram2(''); setUsernameInstagram2('');
      setLinkInstagram3(''); setUsernameInstagram3('');
      setLinkIgReels1(''); setUsernameIgReels1('');
      setLinkIgReels2(''); setUsernameIgReels2('');
      setLinkIgReels3(''); setUsernameIgReels3('');
      setLinkTwitter1(''); setUsernameTwitter1('');
      setLinkTwitter2(''); setUsernameTwitter2('');
      setLinkTwitter3(''); setUsernameTwitter3('');
      setLinkFacebook(''); setUsernameFacebook('');
      setLinkThreads1(''); setUsernameThreads1('');
      setLinkThreads2(''); setUsernameThreads2('');
      setLinkThreads3(''); setUsernameThreads3('');
      setLinkYoutube1(''); setUsernameYoutube1('');
      setLinkYoutube2(''); setUsernameYoutube2('');
      setLinkYoutube3(''); setUsernameYoutube3('');
      setLinkYtVideo1(''); setUsernameYtVideo1('');
      setLinkYtVideo2(''); setUsernameYtVideo2('');
      setLinkYtVideo3(''); setUsernameYtVideo3('');
      setLinkTiktok(''); setUsernameTiktok('');
      setLinkTiktok2(''); setUsernameTiktok2('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/upt');
      }, 2000);

    } catch (err) {
      console.error('Submission error:', err);
      setError('Gagal mengirim laporan. Silakan coba lagi.');
      setUploadProgress('');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-pln-blue border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Memuat formulir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/upt"
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Buat Laporan Baru</h1>
                <p className="text-sm text-gray-500">{uptName}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 animate-slideDown">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Laporan Berhasil Dikirim!
                </h3>
                <p className="text-green-600">
                  Data laporan telah tersimpan. Mengalihkan ke dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-slideDown">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-pln-blue px-6 py-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Formulir Laporan Kinerja
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Isi formulir di bawah ini dengan lengkap dan benar
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Indicator Type */}
            <div>
              <label htmlFor="indicator_type" className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Indikator <span className="text-red-500">*</span>
              </label>
              <select
                id="indicator_type"
                value={indicatorType}
                onChange={(e) => {
                  const selected = e.target.value as IndicatorType;
                  if (selected && isDateBlocked()) {
                    setShowSkoringBlockedModal(true);
                    setIndicatorType('');
                    setSubCategory('');
                    return;
                  }
                  setIndicatorType(selected);
                  // Auto-set subCategory to INFLUENCER for this indicator type
                  if (selected === 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT') {
                    setSubCategory('INFLUENCER');
                  } else {
                    setSubCategory('');
                  }
                }}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">— Pilih Jenis Indikator —</option>
                {INDICATOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>


            {/* Sub-Category (for SKORING MEDIA) */}
            {showSkoringMediaSubCategory && (
              <div className="animate-slideDown">
                <label htmlFor="sub_category_skoring" className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub-Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="sub_category_skoring"
                  value={subCategory}
                  onChange={(e) => {
                    setSubCategory(e.target.value as SkoringMediaSubCategory);

                    setLinkPublikasi('');
                    setNamaMedia('');
                    setTitle('');
                    setExcelFile(null);
                    setParsedTotalScore(null);
                    setUploadProgress('');
                  }}
                  required={showSkoringMediaSubCategory}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">— Pilih Sub-Kategori —</option>
                  {SKORING_MEDIA_SUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Diperlukan untuk indikator SKORING MEDIA MASSA DAN MEDIA SOSIAL
                </p>
              </div>
            )}

            {/* Submission Date */}
            <div>
              <label htmlFor="submission_date" className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Laporan <span className="text-red-500">*</span>
              </label>
              <input
                id="submission_date"
                type="date"
                value={submissionDate}
                min={getMinDate()}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSubmissionDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Nomor Konten (for Influencer) */}
            {isInfluencer && (
              <div className="animate-slideDown">
                <label htmlFor="nomor_konten" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Konten <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomor_konten"
                  type="text"
                  value={nomorKonten}
                  onChange={(e) => setNomorKonten(e.target.value)}
                  required={isInfluencer}
                  disabled={isSubmitting}
                  placeholder="Contoh: INF-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan nomor konten unik
                </p>
              </div>
            )}

            {/* Judul (for Influencer) */}
            {isInfluencer && (
              <div className="animate-slideDown">
                <label htmlFor="title_influencer" className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  id="title_influencer"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={isInfluencer}
                  minLength={VALIDATION_RULES.TITLE.MIN_LENGTH}
                  maxLength={VALIDATION_RULES.TITLE.MAX_LENGTH}
                  disabled={isSubmitting}
                  placeholder="Silahkan tulis judul konten..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal {VALIDATION_RULES.TITLE.MIN_LENGTH} karakter | Saat ini: {title.length}
                </p>
              </div>
            )}

            {/* INFLUENCER FIELDS */}
            {isInfluencer && (
              <div className="animate-slideDown space-y-4">
                {/* Instagram Feed Section - 3 Akun */}
                <div className="bg-linear-to-r from-fuchsia-50 to-pink-50 border border-fuchsia-200 rounded-xl p-4">
                  <h4 className="text-fuchsia-700 font-semibold mb-4 flex items-center gap-2">
                    📸 Instagram Feed (3 Akun) <span className="text-red-500 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkInstagram1, setLink: setLinkInstagram1, user: usernameInstagram1, setUser: setUsernameInstagram1, n: 1 },
                    { link: linkInstagram2, setLink: setLinkInstagram2, user: usernameInstagram2, setUser: setUsernameInstagram2, n: 2 },
                    { link: linkInstagram3, setLink: setLinkInstagram3, user: usernameInstagram3, setUser: setUsernameInstagram3, n: 3 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-fuchsia-200 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Link Feed {item.n} <span className="text-red-500">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://www.instagram.com/p/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Username {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@username" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Instagram Reels Section - 3 Akun */}
                <div className="bg-linear-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                  <h4 className="text-pink-700 font-semibold mb-4 flex items-center gap-2">
                    🎬 Instagram Reels (3 Akun) <span className="text-red-500 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkIgReels1, setLink: setLinkIgReels1, user: usernameIgReels1, setUser: setUsernameIgReels1, n: 1 },
                    { link: linkIgReels2, setLink: setLinkIgReels2, user: usernameIgReels2, setUser: setUsernameIgReels2, n: 2 },
                    { link: linkIgReels3, setLink: setLinkIgReels3, user: usernameIgReels3, setUser: setUsernameIgReels3, n: 3 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-pink-200 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Link Reels {item.n} <span className="text-red-500">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://www.instagram.com/reel/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Username {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@username" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Twitter/X Section - 3 Akun */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    𝕏 Twitter/X (3 Akun) <span className="text-red-400 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkTwitter1, setLink: setLinkTwitter1, user: usernameTwitter1, setUser: setUsernameTwitter1, n: 1 },
                    { link: linkTwitter2, setLink: setLinkTwitter2, user: usernameTwitter2, setUser: setUsernameTwitter2, n: 2 },
                    { link: linkTwitter3, setLink: setLinkTwitter3, user: usernameTwitter3, setUser: setUsernameTwitter3, n: 3 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-slate-700 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Link Twitter {item.n} <span className="text-red-400">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://x.com/..." className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Username {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@username" className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Facebook Section - 1 Akun */}
                <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-4">
                  <h4 className="text-indigo-700 font-semibold mb-4 flex items-center gap-2">
                    👥 Facebook (1 Akun) <span className="text-red-500 text-xs">*Wajib</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Facebook <span className="text-red-500">*</span></label>
                      <input type="url" value={linkFacebook} onChange={(e) => setLinkFacebook(e.target.value)} required disabled={isSubmitting}
                        placeholder="https://www.facebook.com/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username / Page</label>
                      <input type="text" value={usernameFacebook} onChange={(e) => setUsernameFacebook(e.target.value)} disabled={isSubmitting}
                        placeholder="Username atau nama page" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Threads Section - 3 Akun */}
                <div className="bg-linear-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-xl p-4">
                  <h4 className="text-violet-700 font-semibold mb-4 flex items-center gap-2">
                    🧵 Threads (3 Akun) <span className="text-red-500 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkThreads1, setLink: setLinkThreads1, user: usernameThreads1, setUser: setUsernameThreads1, n: 1 },
                    { link: linkThreads2, setLink: setLinkThreads2, user: usernameThreads2, setUser: setUsernameThreads2, n: 2 },
                    { link: linkThreads3, setLink: setLinkThreads3, user: usernameThreads3, setUser: setUsernameThreads3, n: 3 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-violet-200 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Link Threads {item.n} <span className="text-red-500">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://www.threads.net/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Username {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@username" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* YouTube Short Section - 3 Akun */}
                <div className="bg-linear-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-4">
                  <h4 className="text-rose-700 font-semibold mb-4 flex items-center gap-2">
                    ▶️ YouTube Short (3 Akun) <span className="text-red-500 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkYoutube1, setLink: setLinkYoutube1, user: usernameYoutube1, setUser: setUsernameYoutube1, n: 1 },
                    { link: linkYoutube2, setLink: setLinkYoutube2, user: usernameYoutube2, setUser: setUsernameYoutube2, n: 2 },
                    { link: linkYoutube3, setLink: setLinkYoutube3, user: usernameYoutube3, setUser: setUsernameYoutube3, n: 3 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-rose-200 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Link YT Short {item.n} <span className="text-red-500">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://youtube.com/shorts/..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Channel {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@channelname" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* YouTube Video Section - 3 Akun */}
                <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="text-amber-700 font-semibold mb-4 flex items-center gap-2">
                    🎥 YouTube Video (3 Akun) <span className="text-red-500 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkYtVideo1, setLink: setLinkYtVideo1, user: usernameYtVideo1, setUser: setUsernameYtVideo1, n: 1 },
                    { link: linkYtVideo2, setLink: setLinkYtVideo2, user: usernameYtVideo2, setUser: setUsernameYtVideo2, n: 2 },
                    { link: linkYtVideo3, setLink: setLinkYtVideo3, user: usernameYtVideo3, setUser: setUsernameYtVideo3, n: 3 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-amber-200 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Link Video {item.n} <span className="text-red-500">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://youtube.com/watch?v=..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Channel {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@channelname" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* TikTok Section - 2 Akun */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    🎵 TikTok (2 Akun) <span className="text-red-400 text-xs">*Wajib</span>
                  </h4>
                  
                  {[
                    { link: linkTiktok, setLink: setLinkTiktok, user: usernameTiktok, setUser: setUsernameTiktok, n: 1 },
                    { link: linkTiktok2, setLink: setLinkTiktok2, user: usernameTiktok2, setUser: setUsernameTiktok2, n: 2 },
                  ].map((item, idx) => (
                    <div key={idx} className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${idx > 0 ? 'pt-4 border-t border-gray-700 mt-4' : 'mb-4'}`}>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Link TikTok {item.n} <span className="text-red-400">*</span></label>
                        <input type="url" value={item.link} onChange={(e) => item.setLink(e.target.value)} required disabled={isSubmitting}
                          placeholder="https://tiktok.com/..." className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Username {item.n}</label>
                        <input type="text" value={item.user} onChange={(e) => item.setUser(e.target.value)} disabled={isSubmitting}
                          placeholder="@username" className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-500 text-center">
                  ⚠️ Semua platform media sosial wajib diisi
                </p>
              </div>
            )}
            {/* Media Massa Form Fields */}
            {showSkorMediaMassa && (
              <div className="animate-slideDown space-y-4">
                <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-blue-700 font-semibold mb-4 flex items-center gap-2">
                    📰 Data Media Massa
                  </h4>
                  
                  {/* Judul */}
                  <div className="mb-4">
                    <label htmlFor="title_media_massa" className="block text-sm font-semibold text-gray-700 mb-2">
                      Judul <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title_media_massa"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required={showSkorMediaMassa}
                      minLength={VALIDATION_RULES.TITLE.MIN_LENGTH}
                      maxLength={VALIDATION_RULES.TITLE.MAX_LENGTH}
                      disabled={isSubmitting}
                      placeholder="Masukkan judul berita/artikel..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimal {VALIDATION_RULES.TITLE.MIN_LENGTH} karakter | Saat ini: {title.length}
                    </p>
                  </div>

                  {/* Link Publikasi */}
                  <div className="mb-4">
                    <label htmlFor="link_publikasi" className="block text-sm font-semibold text-gray-700 mb-2">
                      Link Publikasi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </span>
                      <input
                        id="link_publikasi"
                        type="url"
                        value={linkPublikasi}
                        onChange={(e) => setLinkPublikasi(e.target.value)}
                        required={showSkorMediaMassa}
                        disabled={isSubmitting}
                        placeholder="https://www.contoh-media.com/artikel..."
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Link harus dimulai dengan http:// atau https://
                    </p>
                  </div>

                  {/* Nama Media */}
                  <div>
                    <label htmlFor="nama_media" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Media <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="nama_media"
                      type="text"
                      value={namaMedia}
                      onChange={(e) => setNamaMedia(e.target.value)}
                      required={showSkorMediaMassa}
                      disabled={isSubmitting}
                      placeholder="Contoh: Kompas, Detik, Tribun..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Media Sosial Form Fields (Template Download + File Upload) */}
            {showSkorMediaSosial && (
              <div className="animate-slideDown space-y-4">
                <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <h4 className="text-green-700 font-semibold mb-4 flex items-center gap-2">
                    📊 Skoring Media Sosial
                  </h4>

                  {/* Step 1: Download Template */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <label className="block text-sm font-semibold text-gray-700">
                        Download Template
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 ml-8">
                      Download file template Excel, isi data sesuai format yang ditentukan.
                    </p>
                    <a
                      href="/template_skoring_media_sosial.xlsx"
                      download="TEMPLATE SKORING MEDSOS UPT.xlsx"
                      className="ml-8 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Template Excel
                    </a>
                    <p className="text-xs text-gray-500 mt-2 ml-8">
                      💡 Setelah download, buka sheet <strong>&quot;medsos&quot;</strong> dan isi data di kolom <strong>J-Q</strong> (No, Kategori, Tanggal, Judul, Link, Username, Platform, Kategori Media).
                    </p>
                  </div>

                  {/* Step 2: Upload File */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <label htmlFor="excel_upload" className="block text-sm font-semibold text-gray-700">
                        Upload File Excel <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 ml-8">
                      Upload file template yang sudah diisi lengkap. Total Score akan otomatis terbaca.
                    </p>
                    <div className="ml-8">
                      <input
                        id="excel_upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setExcelFile(file);
                            // Parse Excel to extract Total Score from the "medsos" sheet
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                                const workbook = XLSX.read(data, { type: 'array' });
                                
                                // Find the "medsos" sheet (the data entry sheet)
                                const medsosSheet = workbook.Sheets['medsos'] || workbook.Sheets['MEDSOS'] || workbook.Sheets[workbook.SheetNames.find(
                                  (name) => name.toLowerCase() === 'medsos'
                                ) || ''];
                                
                                if (!medsosSheet) {
                                  setParsedTotalScore(null);
                                  setError('Sheet "medsos" tidak ditemukan dalam file Excel. Pastikan file yang di-upload adalah template yang benar.');
                                  return;
                                }
                                
                                let totalScore: number | null = null;
                                
                                // Method 1: Read cell D13 directly (known position of Total Score)
                                const cellD13 = medsosSheet['D13'];
                                if (cellD13 && typeof cellD13.v === 'number') {
                                  totalScore = cellD13.v;
                                }
                                
                                // Method 2: Fallback - search for "Total Score" label
                                if (totalScore === null) {
                                  const sheetData = XLSX.utils.sheet_to_json<(string | number | null)[]>(medsosSheet, { header: 1 });
                                  for (const row of sheetData) {
                                    if (!row || !Array.isArray(row)) continue;
                                    for (let colIdx = 0; colIdx < row.length; colIdx++) {
                                      const cellValue = row[colIdx];
                                      if (typeof cellValue === 'string' && cellValue.toLowerCase().trim() === 'total score') {
                                        for (let searchIdx = colIdx + 1; searchIdx < row.length; searchIdx++) {
                                          if (typeof row[searchIdx] === 'number') {
                                            totalScore = row[searchIdx] as number;
                                            break;
                                          }
                                        }
                                        if (totalScore !== null) break;
                                      }
                                    }
                                    if (totalScore !== null) break;
                                  }
                                }
                                
                                if (totalScore !== null) {
                                  setParsedTotalScore(totalScore);
                                } else {
                                  setParsedTotalScore(null);
                                  setError('Total Score tidak ditemukan dalam file Excel. Pastikan format file sesuai template.');
                                }
                              } catch {
                                setParsedTotalScore(null);
                                setError('Gagal membaca file Excel. Pastikan file tidak corrupt.');
                              }
                            };
                            reader.readAsArrayBuffer(file);
                          } else {
                            setExcelFile(null);
                            setParsedTotalScore(null);
                          }
                        }}
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                      />
                      
                      {/* Show parsed Total Score */}
                      {excelFile && parsedTotalScore !== null && (
                        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-green-700">
                              Total Score ditemukan: <span className="text-lg font-bold">{parsedTotalScore}</span>
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {excelFile && parsedTotalScore === null && (
                        <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span className="text-sm text-yellow-700">
                              Total Score tidak ditemukan. Pastikan file sesuai template.
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {uploadProgress && (
                        <p className="text-sm text-blue-600 mt-2 font-medium">{uploadProgress}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* KONTEN VIDEO IN-CHANGE & PENGELOLAAN KOMUNIKASI INTERNAL Fields: Title */}
            {showLinkMedia && (
              <div className="animate-slideDown">
                <label htmlFor="title_link_media" className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  id="title_link_media"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={showLinkMedia}
                  minLength={VALIDATION_RULES.TITLE.MIN_LENGTH}
                  maxLength={VALIDATION_RULES.TITLE.MAX_LENGTH}
                  disabled={isSubmitting}
                  placeholder="Silahkan tulis judul..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal {VALIDATION_RULES.TITLE.MIN_LENGTH} karakter | Saat ini: {title.length}
                </p>
              </div>
            )}

            {/* KONTEN VIDEO IN-CHANGE & PENGELOLAAN KOMUNIKASI INTERNAL Fields: Link Media */}
            {showLinkMedia && (
              <div className="animate-slideDown">
                <label htmlFor="link_media" className="block text-sm font-semibold text-gray-700 mb-2">
                  Link Media <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <input
                    id="link_media"
                    type="url"
                    value={linkMedia}
                    onChange={(e) => setLinkMedia(e.target.value)}
                    required={showLinkMedia}
                    disabled={isSubmitting}
                    placeholder="https://drive.google.com/... atau https://youtube.com/..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Link media sosial atau dokumentasi (harus dimulai dengan http:// atau https://)
                </p>
              </div>
            )}

            {/* Standard Fields: Title */}
            {showStandardFields && (
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={showStandardFields}
                  minLength={VALIDATION_RULES.TITLE.MIN_LENGTH}
                  maxLength={VALIDATION_RULES.TITLE.MAX_LENGTH}
                  disabled={isSubmitting}
                  placeholder="Silahkan tulis judul..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal {VALIDATION_RULES.TITLE.MIN_LENGTH} karakter | Saat ini: {title.length}
                </p>
              </div>
            )}

            {/* Standard Fields: Narasi */}
            {showStandardFields && (
              <div>
                <label htmlFor="narasi" className="block text-sm font-semibold text-gray-700 mb-2">
                  Narasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="narasi"
                  value={narasi}
                  onChange={(e) => setNarasi(e.target.value)}
                  required={showStandardFields}
                  minLength={VALIDATION_RULES.NARASI.MIN_LENGTH}
                  maxLength={VALIDATION_RULES.NARASI.MAX_LENGTH}
                  disabled={isSubmitting}
                  rows={6}
                  placeholder="Silahkan tulis detail deskripsi narasi..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal {VALIDATION_RULES.NARASI.MIN_LENGTH} karakter | Saat ini: {narasi.length}
                </p>
              </div>
            )}

            {/* Standard Fields: Documentation Link */}
            {showStandardFields && (
              <div>
                <label htmlFor="documentation_link" className="block text-sm font-semibold text-gray-700 mb-2">
                  Link Dokumentasi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </span>
                  <input
                    id="documentation_link"
                    type="url"
                    value={documentationLink}
                    onChange={(e) => setDocumentationLink(e.target.value)}
                    required={showStandardFields}
                    disabled={isSubmitting}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Link harus dimulai dengan http:// atau https://
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pln-blue hover:bg-pln-blue-dark text-white font-semibold py-4 px-6 rounded-xl
                           transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]
                           disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none
                           flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengirim Laporan...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Kirim Laporan
                  </>
                )}
              </button>
            </div>

            {/* Footer Info */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Kolom dengan tanda <span className="text-red-500">*</span> wajib diisi
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Sistem Pelaporan Kinerja UPT — PLN Indonesia
          </p>
        </div>
      </main>

      {/* Skoring Media Blocked Modal */}
      {showSkoringBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pemberitahuan</h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700 text-center">
                Waktu sudah menunjukkan batas waktu upload data
              </p>
              <p className="text-white text-center font-semibold bg-red-500 rounded-lg px-4 py-2">
                Anda sudah tidak bisa mengupload data sekarang lagi
              </p>
              <p className="text-gray-700 text-center">
                maksimal upload jam 08.00 WIB
              </p>
            </div>
            <button
              onClick={() => setShowSkoringBlockedModal(false)}
              className="w-full bg-pln-blue hover:bg-pln-blue-dark text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Ok, Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
