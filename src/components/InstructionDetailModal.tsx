'use client';

import { useState } from 'react';
import { databases, ID } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/lib/constants';
import type { Instruction } from '@/types';

interface InstructionDetailModalProps {
  instruction: Instruction | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  currentUptName: string;
  onMarkAsRead?: () => void;
}

export default function InstructionDetailModal({
  instruction,
  isOpen,
  onClose,
  currentUserId,
  currentUptName,
  onMarkAsRead
}: InstructionDetailModalProps) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  if (!isOpen || !instruction) return null;

  const handleMarkAsRead = async () => {
    setIsMarkingRead(true);
    try {
      await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.INSTRUCTION_READS,
        ID.unique(),
        {
          instruction_id: instruction.$id,
          user_id: currentUserId,
          upt_name: currentUptName,
          read_at: new Date().toISOString()
        }
      );
      
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleOpenGoogleDrive = () => {
    window.open(instruction.content_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scaleIn">
        {/* Header */}
        <div className="sticky top-0 bg-pln-blue p-6 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Detail Instruksi
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Dari Admin: {instruction.created_by_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Sub-Kategori</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  instruction.sub_category === 'INFLUENCER'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {instruction.sub_category}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Dipublikasi</p>
                <p className="text-sm text-gray-700">
                  {instruction.published_at
                    ? new Date(instruction.published_at).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Target</p>
                <p className="text-sm text-gray-700">
                  {instruction.target_type === 'ALL' ? (
                    <span className="text-green-600 font-medium">Semua UPT</span>
                  ) : (
                    <span className="text-purple-600">{instruction.target_upt?.join(', ') || 'UPT Tertentu'}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Dibuat Oleh</p>
                <p className="text-sm text-gray-700">{instruction.created_by_name}</p>
              </div>
            </div>
          </div>

          {/* Judul Instruksi */}
          <div className="bg-pln-blue/10 border-l-4 border-pln-blue rounded-r-xl p-4">
            <h3 className="text-sm font-semibold text-pln-blue mb-2">Judul Instruksi</h3>
            <p className="text-lg text-gray-800 font-medium">{instruction.title}</p>
          </div>

          {/* Langkah-langkah */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-pln-blue mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Instruksi untuk UPT
            </h3>
            
            <div className="space-y-4">
              {/* Step 1: Download */}
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-700 mb-2">Download Konten dari Google Drive</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Unduh semua file konten yang sudah disiapkan oleh Admin:
                    </p>
                    <button
                      onClick={handleOpenGoogleDrive}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Buka Google Drive
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="bg-white rounded-xl p-4 border border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-700 mb-2">Upload ke Seluruh Platform Media Sosial</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Upload konten yang sudah didownload ke <strong>semua platform</strong>:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Instagram', 'Twitter/X', 'Facebook', 'TikTok', 'YouTube', 'Lainnya'].map((platform) => (
                        <div key={platform} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                          <span className="text-xs text-gray-600">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Caption Instagram */}
              <div className="bg-white rounded-xl p-4 border border-pink-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                      Caption Instagram
                    </h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word font-sans">
                        {instruction.caption_instagram}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(instruction.caption_instagram);
                        alert('Caption Instagram berhasil dicopy!');
                      }}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Salin Caption
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4: Caption Twitter */}
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                      Caption Twitter/X
                    </h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap wrap-break-word font-sans">
                        {instruction.caption_twitter}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(instruction.caption_twitter);
                        alert('Caption Twitter/X berhasil dicopy!');
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Salin Caption
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5: Submit Report */}
              <div className="bg-white rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-700 mb-2">Isi Form Submission</h4>
                    <p className="text-sm text-gray-600">
                      Setelah upload ke semua platform, jangan lupa isi form submission di dashboard UPT seperti biasa dengan semua link dan username yang sudah diupload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-semibold text-amber-700 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Catatan Penting
            </h4>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Platform lain (Facebook, TikTok, YouTube) gunakan caption yang sesuai</li>
              <li>Pastikan semua link dan username dicatat untuk diisi di form submission</li>
              <li>Gunakan caption yang sudah disediakan untuk konsistensi pesan</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex gap-3 justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
            className="px-6 py-2.5 bg-pln-blue hover:bg-pln-blue-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isMarkingRead ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Tandai Sudah Dibaca
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
