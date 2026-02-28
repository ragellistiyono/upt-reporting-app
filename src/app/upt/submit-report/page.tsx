'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, storage, ID } from '@/lib/appwrite';
import { 
  APPWRITE_CONFIG, 
  INDICATOR_TYPES, 
  SUB_CATEGORIES, 
  SKORING_MEDIA_SUB_CATEGORIES,
  VALIDATION_RULES, 
  MESSAGES 
} from '@/lib/constants';
import type { IndicatorType, SubCategory, SkoringMediaSubCategory } from '@/types';
import * as XLSX from 'xlsx';

export default function SubmitReportPage() {
  const { user, uptName, isLoading, role } = useAuth();
  const router = useRouter();

  // Form state
  const [indicatorType, setIndicatorType] = useState<IndicatorType | ''>('');
  const [subCategory, setSubCategory] = useState<SubCategory | SkoringMediaSubCategory | ''>('');
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
  
  // Influencer/SMR common state
  const [nomorKonten, setNomorKonten] = useState('');
  
  // Influencer state (Instagram - 2 fields)
  const [linkInstagram1, setLinkInstagram1] = useState('');
  const [usernameInstagram1, setUsernameInstagram1] = useState('');
  const [linkInstagram2, setLinkInstagram2] = useState('');
  const [usernameInstagram2, setUsernameInstagram2] = useState('');
  
  // Influencer state (Twitter/X - 2 fields)
  const [linkTwitter1, setLinkTwitter1] = useState('');
  const [usernameTwitter1, setUsernameTwitter1] = useState('');
  const [linkTwitter2, setLinkTwitter2] = useState('');
  const [usernameTwitter2, setUsernameTwitter2] = useState('');
  
  // Influencer state (YouTube - 2 fields)
  const [linkYoutube1, setLinkYoutube1] = useState('');
  const [usernameYoutube1, setUsernameYoutube1] = useState('');
  const [linkYoutube2, setLinkYoutube2] = useState('');
  const [usernameYoutube2, setUsernameYoutube2] = useState('');
  
  // Influencer state (TikTok - 2 fields)
  const [linkTiktok, setLinkTiktok] = useState('');
  const [usernameTiktok, setUsernameTiktok] = useState('');
  const [linkTiktok2, setLinkTiktok2] = useState('');
  const [usernameTiktok2, setUsernameTiktok2] = useState('');
  
  // SMR state (Facebook - 1 field)
  const [linkFacebook, setLinkFacebook] = useState('');
  const [usernameFacebook, setUsernameFacebook] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSkoringBlockedModal, setShowSkoringBlockedModal] = useState(false);

  const isSkoringDateBlocked = () => {
    const today = new Date();
    const day = today.getDate();
    return day === 17 || day === 18;
  };

  // Check if sub-category should be shown
  const showSubCategory = indicatorType === 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT';
  const showSkoringMediaSubCategory = indicatorType === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL' && !isSkoringDateBlocked();
  
  // Check which form fields to show
  const isSkoringMedia = indicatorType === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL';
  const showSkorMediaMassa = isSkoringMedia && subCategory === 'MEDIA MASSA';
  const showSkorMediaSosial = isSkoringMedia && subCategory === 'MEDIA SOSIAL';
  
  const isInfluencer = indicatorType === 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT' && subCategory === 'INFLUENCER';
  const isSMR = indicatorType === 'PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT' && subCategory === 'SMR';
  
  // KONTEN VIDEO IN-CHANGE and PENGELOLAAN KOMUNIKASI INTERNAL use link_media instead of narasi + documentation_link
  const isKontenInChange = indicatorType === 'KONTEN VIDEO IN-CHANGE';
  const isKontenWAG = indicatorType === 'PENGELOLAAN KOMUNIKASI INTERNAL';
  const showLinkMedia = isKontenInChange || isKontenWAG;
  
  const showStandardFields = !isSkoringMedia && !isInfluencer && !isSMR && !showLinkMedia;

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
      { value: usernameInstagram1, name: 'Username Instagram 1' },
      { value: usernameInstagram2, name: 'Username Instagram 2' },
      { value: usernameTwitter1, name: 'Username Twitter 1' },
      { value: usernameTwitter2, name: 'Username Twitter 2' },
      { value: usernameYoutube1, name: 'Username/Channel YouTube 1' },
      { value: usernameYoutube2, name: 'Username/Channel YouTube 2' },
      { value: usernameTiktok, name: 'Username TikTok 1' },
      { value: usernameTiktok2, name: 'Username TikTok 2' },
      { value: usernameFacebook, name: 'Username/Page Facebook' },
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
    } else if (isInfluencer || isSMR) {
      if (!nomorKonten || nomorKonten.trim().length === 0) {
        setError('Silakan masukkan Nomor Konten');
        return;
      }

      if (!title || title.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        setError(`Judul minimal ${VALIDATION_RULES.TITLE.MIN_LENGTH} karakter`);
        return;
      }
       

      const hasAnySocialMedia = isInfluencer
        ? (linkInstagram1 || linkInstagram2 || linkTwitter1 || linkTwitter2 || linkYoutube1 || linkYoutube2 || linkTiktok || linkTiktok2)
        : (linkInstagram1 || linkFacebook || linkTwitter1);

      if (!hasAnySocialMedia) {
        setError('Silakan isi minimal satu link media sosial');
        return;
      }
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
        submissionData.link_instagram_1 = linkInstagram1.trim() || null;
        submissionData.username_instagram_1 = usernameInstagram1.trim() || null;
        submissionData.link_instagram_2 = linkInstagram2.trim() || null;
        submissionData.username_instagram_2 = usernameInstagram2.trim() || null;
        submissionData.link_twitter_1 = linkTwitter1.trim() || null;
        submissionData.username_twitter_1 = usernameTwitter1.trim() || null;
        submissionData.link_twitter_2 = linkTwitter2.trim() || null;
        submissionData.username_twitter_2 = usernameTwitter2.trim() || null;
        submissionData.link_youtube_1 = linkYoutube1.trim() || null;
        submissionData.username_youtube_1 = usernameYoutube1.trim() || null;
        submissionData.link_youtube_2 = linkYoutube2.trim() || null;
        submissionData.username_youtube_2 = usernameYoutube2.trim() || null;
        submissionData.link_tiktok = linkTiktok.trim() || null;
        submissionData.username_tiktok = usernameTiktok.trim() || null;
        submissionData.link_tiktok_2 = linkTiktok2.trim() || null;
        submissionData.username_tiktok_2 = usernameTiktok2.trim() || null;
        submissionData.link_facebook = null;
        submissionData.username_facebook = null;
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else if (isSMR) {
        submissionData.sub_category = 'SMR';
        submissionData.nomor_konten = nomorKonten.trim();
        submissionData.title = title.trim();
        submissionData.narasi = null;
        submissionData.documentation_link = null;
        submissionData.link_instagram_1 = linkInstagram1.trim() || null;
        submissionData.username_instagram_1 = usernameInstagram1.trim() || null;
        submissionData.link_instagram_2 = null;
        submissionData.username_instagram_2 = null;
        submissionData.link_facebook = linkFacebook.trim() || null;
        submissionData.username_facebook = usernameFacebook.trim() || null;
        submissionData.link_twitter_1 = linkTwitter1.trim() || null;
        submissionData.username_twitter_1 = usernameTwitter1.trim() || null;
        submissionData.link_twitter_2 = null;
        submissionData.username_twitter_2 = null;
        submissionData.link_youtube_1 = null;
        submissionData.username_youtube_1 = null;
        submissionData.link_youtube_2 = null;
        submissionData.username_youtube_2 = null;
        submissionData.link_tiktok = null;
        submissionData.username_tiktok = null;
        submissionData.link_tiktok_2 = null;
        submissionData.username_tiktok_2 = null;
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else if (showLinkMedia) {
        // KONTEN VIDEO IN-CHANGE and PENGELOLAAN KOMUNIKASI INTERNAL fields
        submissionData.sub_category = null;
        submissionData.title = title.trim();
        submissionData.narasi = null;
        submissionData.documentation_link = null;
        submissionData.link_media = linkMedia.trim();
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else {
        submissionData.sub_category = showSubCategory && subCategory ? subCategory : null;
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
      setLinkInstagram1('');
      setUsernameInstagram1('');
      setLinkInstagram2('');
      setUsernameInstagram2('');
      setLinkTwitter1('');
      setUsernameTwitter1('');
      setLinkTwitter2('');
      setUsernameTwitter2('');
      setLinkYoutube1('');
      setUsernameYoutube1('');
      setLinkYoutube2('');
      setUsernameYoutube2('');
      setLinkTiktok('');
      setUsernameTiktok('');
      setLinkTiktok2('');
      setUsernameTiktok2('');
      setLinkFacebook('');
      setUsernameFacebook('');

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
                  if (selected === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL' && isSkoringDateBlocked()) {
                    setShowSkoringBlockedModal(true);
                    setIndicatorType('');
                    setSubCategory('');
                    return;
                  }
                  setIndicatorType(selected);
                  setSubCategory('');
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

            {/* Sub-Category (for PENGELOLAAN INFLUENCER MEDIA SOSIAL UNIT) */}
            {showSubCategory && (
              <div className="animate-slideDown">
                <label htmlFor="sub_category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Sub-Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  id="sub_category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                  required={showSubCategory}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">— Pilih Sub-Kategori —</option>
                  {SUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Diperlukan untuk indikator Pengelolaan Influencer Media Sosial Unit
                </p>
              </div>
            )}

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
                onChange={(e) => setSubmissionDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Nomor Konten (for Influencer/SMR) */}
            {(isInfluencer || isSMR) && (
              <div className="animate-slideDown">
                <label htmlFor="nomor_konten" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Konten <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomor_konten"
                  type="text"
                  value={nomorKonten}
                  onChange={(e) => setNomorKonten(e.target.value)}
                  required={isInfluencer || isSMR}
                  disabled={isSubmitting}
                  placeholder="Contoh: INF-001 atau SMR-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan nomor konten unik
                </p>
              </div>
            )}

            {/* Judul (for Influencer/SMR) */}
            {(isInfluencer || isSMR) && (
              <div className="animate-slideDown">
                <label htmlFor="title_influencer" className="block text-sm font-semibold text-gray-700 mb-2">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  id="title_influencer"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required={isInfluencer || isSMR}
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
                {/* Instagram Section */}
                <div className="bg-linear-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
                  <h4 className="text-pink-700 font-semibold mb-4 flex items-center gap-2">
                    📸 Instagram (Maksimal 2 Akun)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Instagram 1</label>
                      <input
                        type="url"
                        value={linkInstagram1}
                        onChange={(e) => setLinkInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.instagram.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username 1</label>
                      <input
                        type="text"
                        value={usernameInstagram1}
                        onChange={(e) => setUsernameInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-pink-200">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Instagram 2</label>
                      <input
                        type="url"
                        value={linkInstagram2}
                        onChange={(e) => setLinkInstagram2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.instagram.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username 2</label>
                      <input
                        type="text"
                        value={usernameInstagram2}
                        onChange={(e) => setUsernameInstagram2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter/X Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-blue-700 font-semibold mb-4 flex items-center gap-2">
                    𝕏 Twitter/X (Maksimal 2 Akun)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Twitter 1</label>
                      <input
                        type="url"
                        value={linkTwitter1}
                        onChange={(e) => setLinkTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username 1</label>
                      <input
                        type="text"
                        value={usernameTwitter1}
                        onChange={(e) => setUsernameTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-blue-200">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Twitter 2</label>
                      <input
                        type="url"
                        value={linkTwitter2}
                        onChange={(e) => setLinkTwitter2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username 2</label>
                      <input
                        type="text"
                        value={usernameTwitter2}
                        onChange={(e) => setUsernameTwitter2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* YouTube Section */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-red-700 font-semibold mb-4 flex items-center gap-2">
                    ▶️ YouTube (Maksimal 2 Channel)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link YouTube 1</label>
                      <input
                        type="url"
                        value={linkYoutube1}
                        onChange={(e) => setLinkYoutube1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://youtube.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Channel 1</label>
                      <input
                        type="text"
                        value={usernameYoutube1}
                        onChange={(e) => setUsernameYoutube1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@channelname"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-red-200">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link YouTube 2</label>
                      <input
                        type="url"
                        value={linkYoutube2}
                        onChange={(e) => setLinkYoutube2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://youtube.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Channel 2</label>
                      <input
                        type="text"
                        value={usernameYoutube2}
                        onChange={(e) => setUsernameYoutube2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@channelname"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* TikTok Section */}
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    🎵 TikTok
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Link TikTok 1</label>
                      <input
                        type="url"
                        value={linkTiktok}
                        onChange={(e) => setLinkTiktok(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://tiktok.com/..."
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Username 1</label>
                      <input
                        type="text"
                        value={usernameTiktok}
                        onChange={(e) => setUsernameTiktok(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700 mt-4">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Link TikTok 2</label>
                      <input
                        type="url"
                        value={linkTiktok2}
                        onChange={(e) => setLinkTiktok2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://tiktok.com/..."
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Username 2</label>
                      <input
                        type="text"
                        value={usernameTiktok2}
                        onChange={(e) => setUsernameTiktok2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  💡 Minimal isi 1 platform media sosial
                </p>
              </div>
            )}

            {/* SMR FIELDS */}
            {isSMR && (
              <div className="animate-slideDown space-y-4">
                {/* Instagram Section */}
                <div className="bg-linear-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4">
                  <h4 className="text-pink-700 font-semibold mb-4 flex items-center gap-2">
                    📸 Instagram
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Instagram</label>
                      <input
                        type="url"
                        value={linkInstagram1}
                        onChange={(e) => setLinkInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.instagram.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username</label>
                      <input
                        type="text"
                        value={usernameInstagram1}
                        onChange={(e) => setUsernameInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-blue-700 font-semibold mb-4 flex items-center gap-2">
                    👥 Facebook
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Facebook</label>
                      <input
                        type="url"
                        value={linkFacebook}
                        onChange={(e) => setLinkFacebook(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.facebook.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username / Page</label>
                      <input
                        type="text"
                        value={usernameFacebook}
                        onChange={(e) => setUsernameFacebook(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Username atau nama page"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter Section */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                  <h4 className="text-sky-700 font-semibold mb-4 flex items-center gap-2">
                    𝕏 Twitter/X
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Link Twitter</label>
                      <input
                        type="url"
                        value={linkTwitter1}
                        onChange={(e) => setLinkTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://twitter.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Username</label>
                      <input
                        type="text"
                        value={usernameTwitter1}
                        onChange={(e) => setUsernameTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  💡 Minimal isi 1 platform media sosial
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
                      💡 Setelah download, buka sheet <strong>&quot;{uptName?.toUpperCase()}&quot;</strong> dan isi data di kolom <strong>J-Q</strong> (No, Kategori, Tanggal, Judul, Link, Username, Platform, Kategori Media).
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
                      Upload file template yang sudah diisi lengkap. Total Score akan otomatis terbaca dari sheet <strong>&quot;{uptName?.toUpperCase()}&quot;</strong>.
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
                            // Parse Excel to extract Total Score from the UPT-specific sheet
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                                const workbook = XLSX.read(data, { type: 'array' });
                                
                                // Find the sheet matching the logged-in UPT name (case-insensitive)
                                const uptSheetName = workbook.SheetNames.find(
                                  (name) => name.toLowerCase() === uptName?.toLowerCase()
                                );
                                
                                if (!uptSheetName) {
                                  setParsedTotalScore(null);
                                  setError(`Sheet "${uptName?.toUpperCase()}" tidak ditemukan dalam file Excel. Pastikan file yang di-upload adalah template yang benar.`);
                                  return;
                                }
                                
                                const uptSheet = workbook.Sheets[uptSheetName];
                                let totalScore: number | null = null;
                                
                                // Method 1: Read cell D13 directly (known position of Total Score)
                                const cellD13 = uptSheet['D13'];
                                if (cellD13 && typeof cellD13.v === 'number') {
                                  totalScore = cellD13.v;
                                }
                                
                                // Method 2: Fallback - search for "Total Score" label
                                if (totalScore === null) {
                                  const sheetData = XLSX.utils.sheet_to_json<(string | number | null)[]>(uptSheet, { header: 1 });
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
