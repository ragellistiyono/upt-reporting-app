'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { databases, ID } from '@/lib/appwrite';
import { 
  APPWRITE_CONFIG, 
  INDICATOR_TYPES, 
  SUB_CATEGORIES, 
  SKORING_MEDIA_SUB_CATEGORIES,
  VALIDATION_RULES, 
  MESSAGES 
} from '@/lib/constants';
import type { IndicatorType, SubCategory, SkoringMediaSubCategory } from '@/types';

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
  
  // Skoring Media state
  const [skorMediaMassa, setSkorMediaMassa] = useState<number | ''>('');
  const [skorMediaSosial, setSkorMediaSosial] = useState<number | ''>('');
  
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
  
  // Influencer state (TikTok - 1 field)
  const [linkTiktok, setLinkTiktok] = useState('');
  const [usernameTiktok, setUsernameTiktok] = useState('');
  
  // SMR state (Facebook - 1 field)
  const [linkFacebook, setLinkFacebook] = useState('');
  const [usernameFacebook, setUsernameFacebook] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if sub-category should be shown
  const showSubCategory = indicatorType === 'INFLUENCER DAN SMR';
  const showSkoringMediaSubCategory = indicatorType === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL';
  
  // Check which form fields to show
  const isSkoringMedia = indicatorType === 'SKORING MEDIA MASSA DAN MEDIA SOSIAL';
  const showSkorMediaMassa = isSkoringMedia && subCategory === 'MEDIA MASSA';
  const showSkorMediaSosial = isSkoringMedia && subCategory === 'MEDIA SOSIAL';
  
  const isInfluencer = indicatorType === 'INFLUENCER DAN SMR' && subCategory === 'INFLUENCER';
  const isSMR = indicatorType === 'INFLUENCER DAN SMR' && subCategory === 'SMR';
  
  // KONTEN IN-CHANGE and KONTEN WAG use link_media instead of narasi + documentation_link
  const isKontenInChange = indicatorType === 'KONTEN IN-CHANGE';
  const isKontenWAG = indicatorType === 'KONTEN WAG';
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
      { value: usernameTiktok, name: 'Username TikTok' },
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

      if (subCategory === 'MEDIA MASSA' && (!skorMediaMassa || skorMediaMassa <= 0)) {
        setError('Masukkan nilai Skor Media Massa yang valid (harus lebih dari 0)');
        return;
      }

      if (subCategory === 'MEDIA SOSIAL' && (!skorMediaSosial || skorMediaSosial <= 0)) {
        setError('Masukkan nilai Skor Media Sosial yang valid (harus lebih dari 0)');
        return;
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
        ? (linkInstagram1 || linkInstagram2 || linkTwitter1 || linkTwitter2 || linkYoutube1 || linkYoutube2 || linkTiktok)
        : (linkInstagram1 || linkFacebook || linkTwitter1);

      if (!hasAnySocialMedia) {
        setError('Silakan isi minimal satu link media sosial');
        return;
      }
    } else if (showLinkMedia) {
      // Validation for KONTEN IN-CHANGE and KONTEN WAG
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
          submissionData.skor_media_massa = Number(skorMediaMassa);
          submissionData.skor_media_sosial = null;
        } else if (subCategory === 'MEDIA SOSIAL') {
          submissionData.skor_media_sosial = Number(skorMediaSosial);
          submissionData.skor_media_massa = null;
        }
        submissionData.title = null;
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
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else if (showLinkMedia) {
        // KONTEN IN-CHANGE and KONTEN WAG fields
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
      setSkorMediaMassa('');
      setSkorMediaSosial('');
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
      setLinkFacebook('');
      setUsernameFacebook('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/upt');
      }, 2000);

    } catch (err) {
      console.error('Submission error:', err);
      setError('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
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
                  setIndicatorType(e.target.value as IndicatorType);
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

            {/* Sub-Category (for INFLUENCER DAN SMR) */}
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
                  Diperlukan untuk indikator INFLUENCER DAN SMR
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
                    setSkorMediaMassa('');
                    setSkorMediaSosial('');
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
                      <label className="block text-sm text-gray-300 mb-1">Link TikTok</label>
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
                      <label className="block text-sm text-gray-300 mb-1">Username</label>
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

            {/* Skor Media Massa */}
            {showSkorMediaMassa && (
              <div className="animate-slideDown">
                <label htmlFor="skor_media_massa" className="block text-sm font-semibold text-gray-700 mb-2">
                  Skor Media Massa <span className="text-red-500">*</span>
                </label>
                <input
                  id="skor_media_massa"
                  type="number"
                  value={skorMediaMassa}
                  onChange={(e) => setSkorMediaMassa(e.target.value ? Number(e.target.value) : '')}
                  required={showSkorMediaMassa}
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  placeholder="Contoh: 570000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan nilai skor media massa (contoh: 570000)
                </p>
              </div>
            )}

            {/* Skor Media Sosial */}
            {showSkorMediaSosial && (
              <div className="animate-slideDown">
                <label htmlFor="skor_media_sosial" className="block text-sm font-semibold text-gray-700 mb-2">
                  Skor Media Sosial <span className="text-red-500">*</span>
                </label>
                <input
                  id="skor_media_sosial"
                  type="number"
                  value={skorMediaSosial}
                  onChange={(e) => setSkorMediaSosial(e.target.value ? Number(e.target.value) : '')}
                  required={showSkorMediaSosial}
                  min="0"
                  step="0.01"
                  disabled={isSubmitting}
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-pln-blue focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Masukkan nilai skor media sosial (contoh: 5000)
                </p>
              </div>
            )}

            {/* KONTEN IN-CHANGE & KONTEN WAG Fields: Title */}
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

            {/* KONTEN IN-CHANGE & KONTEN WAG Fields: Link Media */}
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
    </div>
  );
}
