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
  
  const showStandardFields = !isSkoringMedia && !isInfluencer && !isSMR; // title, narasi, documentation_link

  // Redirect if not UPT user (useEffect to avoid hook order issues)
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
      setError('User not authenticated');
      return;
    }

    if (!uptName) {
      setError('UPT name not found in user profile');
      return;
    }

    // Validate based on indicator type
    if (isSkoringMedia) {
      // Validation for Skoring Media
      if (!subCategory) {
        setError('Please select a sub-category (Media Massa or Media Sosial)');
        return;
      }

      if (subCategory === 'MEDIA MASSA' && (!skorMediaMassa || skorMediaMassa <= 0)) {
        setError('Please enter a valid Skor Media Massa (must be greater than 0)');
        return;
      }

      if (subCategory === 'MEDIA SOSIAL' && (!skorMediaSosial || skorMediaSosial <= 0)) {
        setError('Please enter a valid Skor Media Sosial (must be greater than 0)');
        return;
      }
    } else if (isInfluencer || isSMR) {
      // Validation for Influencer/SMR
      if (!nomorKonten || nomorKonten.trim().length === 0) {
        setError('Please enter Nomor Konten');
        return;
      }

      if (!title || title.trim().length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        setError(`Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`);
        return;
      }

      // At least one social media link must be filled
      const hasAnySocialMedia = isInfluencer
        ? (linkInstagram1 || linkInstagram2 || linkTwitter1 || linkTwitter2 || linkYoutube1 || linkYoutube2 || linkTiktok)
        : (linkInstagram1 || linkFacebook || linkTwitter1);

      if (!hasAnySocialMedia) {
        setError('Please enter at least one social media link');
        return;
      }
    } else {
      // Validation for standard indicators
      if (title.length < VALIDATION_RULES.TITLE.MIN_LENGTH) {
        setError(`Title must be at least ${VALIDATION_RULES.TITLE.MIN_LENGTH} characters`);
        return;
      }

      if (narasi.length < VALIDATION_RULES.NARASI.MIN_LENGTH) {
        setError(`Narasi must be at least ${VALIDATION_RULES.NARASI.MIN_LENGTH} characters`);
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
        // Set optional fields to null for Skoring Media
        submissionData.title = null;
        submissionData.narasi = null;
        submissionData.documentation_link = null;
      } else if (isInfluencer) {
        // Influencer data
        submissionData.sub_category = 'INFLUENCER';
        submissionData.nomor_konten = nomorKonten.trim();
        submissionData.title = title.trim();
        submissionData.narasi = null;
        submissionData.documentation_link = null;
        // Instagram (2 fields)
        submissionData.link_instagram_1 = linkInstagram1.trim() || null;
        submissionData.username_instagram_1 = usernameInstagram1.trim() || null;
        submissionData.link_instagram_2 = linkInstagram2.trim() || null;
        submissionData.username_instagram_2 = usernameInstagram2.trim() || null;
        // Twitter/X (2 fields)
        submissionData.link_twitter_1 = linkTwitter1.trim() || null;
        submissionData.username_twitter_1 = usernameTwitter1.trim() || null;
        submissionData.link_twitter_2 = linkTwitter2.trim() || null;
        submissionData.username_twitter_2 = usernameTwitter2.trim() || null;
        // YouTube (2 fields)
        submissionData.link_youtube_1 = linkYoutube1.trim() || null;
        submissionData.username_youtube_1 = usernameYoutube1.trim() || null;
        submissionData.link_youtube_2 = linkYoutube2.trim() || null;
        submissionData.username_youtube_2 = usernameYoutube2.trim() || null;
        // TikTok (1 field)
        submissionData.link_tiktok = linkTiktok.trim() || null;
        submissionData.username_tiktok = usernameTiktok.trim() || null;
        // Facebook (not used for Influencer)
        submissionData.link_facebook = null;
        submissionData.username_facebook = null;
        // Skoring media (not used)
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else if (isSMR) {
        // SMR data
        submissionData.sub_category = 'SMR';
        submissionData.nomor_konten = nomorKonten.trim();
        submissionData.title = title.trim();
        submissionData.narasi = null;
        submissionData.documentation_link = null;
        // Instagram (1 field)
        submissionData.link_instagram_1 = linkInstagram1.trim() || null;
        submissionData.username_instagram_1 = usernameInstagram1.trim() || null;
        submissionData.link_instagram_2 = null;
        submissionData.username_instagram_2 = null;
        // Facebook (1 field)
        submissionData.link_facebook = linkFacebook.trim() || null;
        submissionData.username_facebook = usernameFacebook.trim() || null;
        // Twitter/X (1 field)
        submissionData.link_twitter_1 = linkTwitter1.trim() || null;
        submissionData.username_twitter_1 = usernameTwitter1.trim() || null;
        submissionData.link_twitter_2 = null;
        submissionData.username_twitter_2 = null;
        // YouTube & TikTok (not used for SMR)
        submissionData.link_youtube_1 = null;
        submissionData.username_youtube_1 = null;
        submissionData.link_youtube_2 = null;
        submissionData.username_youtube_2 = null;
        submissionData.link_tiktok = null;
        submissionData.username_tiktok = null;
        // Skoring media (not used)
        submissionData.skor_media_massa = null;
        submissionData.skor_media_sosial = null;
      } else {
        // Standard indicator
        submissionData.sub_category = showSubCategory && subCategory ? subCategory : null;
        submissionData.title = title.trim();
        submissionData.narasi = narasi.trim();
        submissionData.documentation_link = documentationLink.trim();
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
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-neon-green font-mono">LOADING SUBMISSION INTERFACE...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-cyber-light border-2 border-neon-green rounded-lg p-4 mb-6 shadow-glow-green-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-green rounded-lg flex items-center justify-center shadow-glow-green">
                <span className="text-cyber-dark font-mono font-bold text-xl">➕</span>
              </div>
              <div>
                <h1 className="text-neon-green text-3xl font-mono font-bold tracking-wider">
                  NEW SUBMISSION
                </h1>
                <p className="text-cyber-text-dim font-mono text-sm">
                  {uptName ? uptName.toUpperCase() : 'UPT USER'} {'//'} CREATE REPORT
                </p>
              </div>
            </div>
            
            <Link
              href="/upt"
              className="bg-cyber-dark border-2 border-neon-green text-neon-green px-4 py-2 rounded font-mono
                         hover:bg-neon-green hover:text-cyber-dark hover:shadow-glow-green-sm
                         transition-all duration-300"
            >
              BACK
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-6 mb-6 shadow-glow-green">
            <div className="text-center">
              <div className="flex w-16 h-16 bg-neon-green rounded-full items-center justify-center mb-4 shadow-glow-green">
                <span className="text-cyber-dark text-3xl">✓</span>
              </div>
              <h3 className="text-neon-green text-xl font-mono font-bold mb-2">
                SUBMISSION SUCCESSFUL
              </h3>
              <p className="text-cyber-text font-mono text-sm">
                {'>'} Report has been saved to the database
              </p>
              <p className="text-cyber-text-dim font-mono text-sm mt-1">
                {'>'} Redirecting to dashboard...
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-950/50 border-2 border-red-500 rounded-lg p-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <p className="text-red-400 font-mono text-sm flex items-center gap-2">
              <span className="text-red-500 text-xl">⚠</span>
              {error}
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-cyber-darker border-2 border-neon-green rounded-lg p-8 shadow-glow-green-sm">
          {/* Terminal Header */}
          <div className="mb-6 border-l-2 border-neon-green pl-3">
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> INITIALIZING SUBMISSION PROTOCOL...
            </p>
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> REPORTER: {uptName}
            </p>
            <p className="text-cyber-text-dim font-mono text-xs">
              <span className="text-neon-green">{'>'}</span> ENTER PERFORMANCE DATA BELOW
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Indicator Type */}
            <div>
              <label htmlFor="indicator_type" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} INDICATOR_TYPE: <span className="text-red-400">*</span>
              </label>
              <select
                id="indicator_type"
                value={indicatorType}
                onChange={(e) => {
                  setIndicatorType(e.target.value as IndicatorType);
                  setSubCategory(''); // Reset sub-category when indicator changes
                }}
                required
                disabled={isSubmitting}
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
              >
                <option value="">-- SELECT INDICATOR --</option>
                {INDICATOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Category (Conditional for INFLUENCER DAN SMR) */}
            {showSubCategory && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="sub_category" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} SUB_CATEGORY: <span className="text-red-400">*</span>
                </label>
                <select
                  id="sub_category"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as SubCategory)}
                  required={showSubCategory}
                  disabled={isSubmitting}
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300"
                >
                  <option value="">-- SELECT SUB-CATEGORY --</option>
                  {SUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Required for INFLUENCER DAN SMR indicator
                </p>
              </div>
            )}

            {/* Sub-Category (Conditional for SKORING MEDIA) */}
            {showSkoringMediaSubCategory && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="sub_category_skoring" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} SUB_CATEGORY: <span className="text-red-400">*</span>
                </label>
                <select
                  id="sub_category_skoring"
                  value={subCategory}
                  onChange={(e) => {
                    setSubCategory(e.target.value as SkoringMediaSubCategory);
                    // Reset skor fields when sub-category changes
                    setSkorMediaMassa('');
                    setSkorMediaSosial('');
                  }}
                  required={showSkoringMediaSubCategory}
                  disabled={isSubmitting}
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300"
                >
                  <option value="">-- SELECT SUB-CATEGORY --</option>
                  {SKORING_MEDIA_SUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Required for SKORING MEDIA MASSA DAN MEDIA SOSIAL indicator
                </p>
              </div>
            )}

            {/* Submission Date */}
            <div>
              <label htmlFor="submission_date" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                {'>'} SUBMISSION_DATE: <span className="text-red-400">*</span>
              </label>
              <input
                id="submission_date"
                type="date"
                value={submissionDate}
                onChange={(e) => setSubmissionDate(e.target.value)}
                required
                disabled={isSubmitting}
                className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                          focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-all duration-300"
              />
            </div>

            {/* Nomor Konten (for Influencer/SMR) */}
            {(isInfluencer || isSMR) && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="nomor_konten" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} NOMOR_KONTEN: <span className="text-red-400">*</span>
                </label>
                <input
                  id="nomor_konten"
                  type="text"
                  value={nomorKonten}
                  onChange={(e) => setNomorKonten(e.target.value)}
                  required={isInfluencer || isSMR}
                  disabled={isSubmitting}
                  placeholder="Contoh: INF-001 atau SMR-001"
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Masukkan nomor konten unik
                </p>
              </div>
            )}

            {/* Judul (for Influencer/SMR) */}
            {(isInfluencer || isSMR) && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="title_influencer" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} JUDUL: <span className="text-red-400">*</span>
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
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Min: {VALIDATION_RULES.TITLE.MIN_LENGTH} chars | Current: {title.length}
                </p>
              </div>
            )}

            {/* INFLUENCER FIELDS */}
            {isInfluencer && (
              <div className="animate-[slideDown_0.3s_ease-out] space-y-6">
                {/* Instagram Section (2 fields) */}
                <div className="border-2 border-neon-blue/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-blue font-mono font-bold mb-4 flex items-center gap-2">
                    <span>📸</span> INSTAGRAM (Max 2 Accounts)
                  </h4>
                  
                  {/* Instagram 1 */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label htmlFor="link_instagram_1" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Instagram 1:
                      </label>
                      <input
                        id="link_instagram_1"
                        type="url"
                        value={linkInstagram1}
                        onChange={(e) => setLinkInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.instagram.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_instagram_1" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Instagram 1:
                      </label>
                      <input
                        id="username_instagram_1"
                        type="text"
                        value={usernameInstagram1}
                        onChange={(e) => setUsernameInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>

                  {/* Instagram 2 */}
                  <div className="space-y-4 pt-4 border-t border-cyber-light/30">
                    <div>
                      <label htmlFor="link_instagram_2" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Instagram 2:
                      </label>
                      <input
                        id="link_instagram_2"
                        type="url"
                        value={linkInstagram2}
                        onChange={(e) => setLinkInstagram2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.instagram.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_instagram_2" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Instagram 2:
                      </label>
                      <input
                        id="username_instagram_2"
                        type="text"
                        value={usernameInstagram2}
                        onChange={(e) => setUsernameInstagram2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter/X Section (2 fields) */}
                <div className="border-2 border-neon-blue/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-blue font-mono font-bold mb-4 flex items-center gap-2">
                    <span>𝕏</span> TWITTER/X (Max 2 Accounts)
                  </h4>
                  
                  {/* Twitter 1 */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label htmlFor="link_twitter_1" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Twitter/X 1:
                      </label>
                      <input
                        id="link_twitter_1"
                        type="url"
                        value={linkTwitter1}
                        onChange={(e) => setLinkTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://twitter.com/... or https://x.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_twitter_1" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Twitter/X 1:
                      </label>
                      <input
                        id="username_twitter_1"
                        type="text"
                        value={usernameTwitter1}
                        onChange={(e) => setUsernameTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>

                  {/* Twitter 2 */}
                  <div className="space-y-4 pt-4 border-t border-cyber-light/30">
                    <div>
                      <label htmlFor="link_twitter_2" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Twitter/X 2:
                      </label>
                      <input
                        id="link_twitter_2"
                        type="url"
                        value={linkTwitter2}
                        onChange={(e) => setLinkTwitter2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://twitter.com/... or https://x.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_twitter_2" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Twitter/X 2:
                      </label>
                      <input
                        id="username_twitter_2"
                        type="text"
                        value={usernameTwitter2}
                        onChange={(e) => setUsernameTwitter2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                {/* YouTube Section (2 fields) */}
                <div className="border-2 border-neon-blue/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-blue font-mono font-bold mb-4 flex items-center gap-2">
                    <span>▶️</span> YOUTUBE (Max 2 Channels)
                  </h4>
                  
                  {/* YouTube 1 */}
                  <div className="space-y-4 mb-4">
                    <div>
                      <label htmlFor="link_youtube_1" className="block text-cyber-text font-mono text-sm mb-1">
                        Link YouTube 1:
                      </label>
                      <input
                        id="link_youtube_1"
                        type="url"
                        value={linkYoutube1}
                        onChange={(e) => setLinkYoutube1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.youtube.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_youtube_1" className="block text-cyber-text font-mono text-sm mb-1">
                        Username/Channel YouTube 1:
                      </label>
                      <input
                        id="username_youtube_1"
                        type="text"
                        value={usernameYoutube1}
                        onChange={(e) => setUsernameYoutube1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@channelname"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>

                  {/* YouTube 2 */}
                  <div className="space-y-4 pt-4 border-t border-cyber-light/30">
                    <div>
                      <label htmlFor="link_youtube_2" className="block text-cyber-text font-mono text-sm mb-1">
                        Link YouTube 2:
                      </label>
                      <input
                        id="link_youtube_2"
                        type="url"
                        value={linkYoutube2}
                        onChange={(e) => setLinkYoutube2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.youtube.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_youtube_2" className="block text-cyber-text font-mono text-sm mb-1">
                        Username/Channel YouTube 2:
                      </label>
                      <input
                        id="username_youtube_2"
                        type="text"
                        value={usernameYoutube2}
                        onChange={(e) => setUsernameYoutube2(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@channelname"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                {/* TikTok Section (1 field) */}
                <div className="border-2 border-neon-blue/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-blue font-mono font-bold mb-4 flex items-center gap-2">
                    <span>🎵</span> TIKTOK
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="link_tiktok" className="block text-cyber-text font-mono text-sm mb-1">
                        Link TikTok:
                      </label>
                      <input
                        id="link_tiktok"
                        type="url"
                        value={linkTiktok}
                        onChange={(e) => setLinkTiktok(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.tiktok.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_tiktok" className="block text-cyber-text font-mono text-sm mb-1">
                        Username TikTok:
                      </label>
                      <input
                        id="username_tiktok"
                        type="text"
                        value={usernameTiktok}
                        onChange={(e) => setUsernameTiktok(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-blue focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-cyber-text-dim font-mono text-xs text-center">
                  {'>'} Minimal isi 1 social media platform
                </p>
              </div>
            )}

            {/* SMR FIELDS */}
            {isSMR && (
              <div className="animate-[slideDown_0.3s_ease-out] space-y-6">
                {/* Instagram Section (1 field) */}
                <div className="border-2 border-neon-purple/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-purple font-mono font-bold mb-4 flex items-center gap-2">
                    <span>📸</span> INSTAGRAM
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="link_instagram_smr" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Instagram:
                      </label>
                      <input
                        id="link_instagram_smr"
                        type="url"
                        value={linkInstagram1}
                        onChange={(e) => setLinkInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.instagram.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-purple focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_instagram_smr" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Instagram:
                      </label>
                      <input
                        id="username_instagram_smr"
                        type="text"
                        value={usernameInstagram1}
                        onChange={(e) => setUsernameInstagram1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-purple focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook Section (1 field) */}
                <div className="border-2 border-neon-purple/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-purple font-mono font-bold mb-4 flex items-center gap-2">
                    <span>👥</span> FACEBOOK
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="link_facebook" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Facebook:
                      </label>
                      <input
                        id="link_facebook"
                        type="url"
                        value={linkFacebook}
                        onChange={(e) => setLinkFacebook(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://www.facebook.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-purple focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_facebook" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Facebook:
                      </label>
                      <input
                        id="username_facebook"
                        type="text"
                        value={usernameFacebook}
                        onChange={(e) => setUsernameFacebook(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="username atau page name"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-purple focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter Section (1 field) */}
                <div className="border-2 border-neon-purple/30 rounded-lg p-4 bg-cyber-light/20">
                  <h4 className="text-neon-purple font-mono font-bold mb-4 flex items-center gap-2">
                    <span>𝕏</span> TWITTER/X
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="link_twitter_smr" className="block text-cyber-text font-mono text-sm mb-1">
                        Link Twitter/X:
                      </label>
                      <input
                        id="link_twitter_smr"
                        type="url"
                        value={linkTwitter1}
                        onChange={(e) => setLinkTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://twitter.com/... or https://x.com/..."
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-purple focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                    <div>
                      <label htmlFor="username_twitter_smr" className="block text-cyber-text font-mono text-sm mb-1">
                        Username Twitter/X:
                      </label>
                      <input
                        id="username_twitter_smr"
                        type="text"
                        value={usernameTwitter1}
                        onChange={(e) => setUsernameTwitter1(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="@username"
                        className="w-full bg-cyber-dark border border-cyber-light text-cyber-text font-mono px-3 py-2 rounded text-sm
                                  focus:border-neon-purple focus:outline-none
                                  placeholder:text-cyber-text-dim placeholder:italic"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-cyber-text-dim font-mono text-xs text-center">
                  {'>'} Minimal isi 1 social media platform
                </p>
              </div>
            )}

            {/* Skor Media Massa (Conditional for SKORING MEDIA - MEDIA MASSA) */}
            {showSkorMediaMassa && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="skor_media_massa" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} SKOR_MEDIA_MASSA: <span className="text-red-400">*</span>
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
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Masukkan nilai skor media massa (contoh: 570000)
                </p>
              </div>
            )}

            {/* Skor Media Sosial (Conditional for SKORING MEDIA - MEDIA SOSIAL) */}
            {showSkorMediaSosial && (
              <div className="animate-[slideDown_0.3s_ease-out]">
                <label htmlFor="skor_media_sosial" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} SKOR_MEDIA_SOSIAL: <span className="text-red-400">*</span>
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
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Masukkan nilai skor media sosial (contoh: 5000)
                </p>
              </div>
            )}

            {/* Title (Only for standard indicators) */}
            {showStandardFields && (
              <div>
                <label htmlFor="title" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} TITLE: <span className="text-red-400">*</span>
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
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Min: {VALIDATION_RULES.TITLE.MIN_LENGTH} chars | Current: {title.length}
                </p>
              </div>
            )}

            {/* Narasi (Only for standard indicators) */}
            {showStandardFields && (
              <div>
                <label htmlFor="narasi" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} NARASI: <span className="text-red-400">*</span>
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
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300 resize-y
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Min: {VALIDATION_RULES.NARASI.MIN_LENGTH} chars | Current: {narasi.length}
                </p>
              </div>
            )}

            {/* Documentation Link (Only for standard indicators) */}
            {showStandardFields && (
              <div>
                <label htmlFor="documentation_link" className="block text-neon-green font-mono text-sm mb-2 tracking-wide">
                  {'>'} DOCUMENTATION_LINK: <span className="text-red-400">*</span>
                </label>
                <input
                  id="documentation_link"
                  type="url"
                  value={documentationLink}
                  onChange={(e) => setDocumentationLink(e.target.value)}
                  required={showStandardFields}
                  disabled={isSubmitting}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-cyber-dark border-2 border-cyber-light text-cyber-text font-mono px-4 py-3 rounded
                            focus:border-neon-green focus:shadow-glow-green-sm focus:outline-none
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transition-all duration-300
                            placeholder:text-cyber-text-dim placeholder:italic"
                />
                <p className="text-cyber-text-dim font-mono text-xs mt-1">
                  {'>'} Must start with http:// or https://
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4 border-t border-cyber-light">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neon-green text-cyber-dark font-mono font-bold py-4 px-6 rounded
                           shadow-glow-green hover:bg-neon-blue hover:shadow-glow-blue
                           disabled:bg-cyber-light disabled:text-cyber-text-dim disabled:shadow-none
                           transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]
                           disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    TRANSMITTING DATA...
                  </span>
                ) : (
                  '[ SUBMIT REPORT ]'
                )}
              </button>
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-cyber-light">
            <p className="text-cyber-text-dim font-mono text-xs text-center">
              <span className="text-neon-green">⬡</span> All fields marked with <span className="text-red-400">*</span> are required
            </p>
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
