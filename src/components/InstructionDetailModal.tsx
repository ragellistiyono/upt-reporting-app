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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-cyber-darker border-2 border-neon-blue rounded-lg shadow-glow-blue w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cyber-light border-b-2 border-neon-blue p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-neon-blue text-2xl font-mono font-bold flex items-center gap-3">
                <span>📋</span> INSTRUCTION DETAILS
              </h2>
              <p className="text-cyber-text-dim font-mono text-sm mt-1">
                {'>'} From Admin: {instruction.created_by_name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-cyber-text hover:text-neon-blue transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Metadata */}
          <div className="bg-cyber-light border-2 border-neon-blue/30 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-cyber-text-dim font-mono text-xs mb-1">SUB-CATEGORY:</p>
                <p className="text-neon-blue font-mono text-sm font-bold">{instruction.sub_category}</p>
              </div>
              <div>
                <p className="text-cyber-text-dim font-mono text-xs mb-1">PUBLISHED:</p>
                <p className="text-cyber-text font-mono text-sm">
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
                <p className="text-cyber-text-dim font-mono text-xs mb-1">TARGET:</p>
                <p className="text-cyber-text font-mono text-sm">
                  {instruction.target_type === 'ALL' ? (
                    <span className="text-neon-green">All UPTs</span>
                  ) : (
                    <span className="text-neon-purple">
                      {instruction.target_upt?.join(', ') || 'Specific UPTs'}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-cyber-text-dim font-mono text-xs mb-1">CREATED BY:</p>
                <p className="text-cyber-text font-mono text-sm">{instruction.created_by_name}</p>
              </div>
            </div>
          </div>

          {/* Judul Instruksi */}
          <div className="bg-cyber-light border-l-4 border-neon-pink rounded-r-lg p-4">
            <h3 className="text-neon-pink font-mono text-sm font-bold mb-2">
              📌 JUDUL INSTRUKSI:
            </h3>
            <p className="text-cyber-text font-mono text-lg">{instruction.title}</p>
          </div>

          {/* Instruksi Utama */}
          <div className="bg-neon-blue/10 border-2 border-neon-blue rounded-lg p-6">
            <h3 className="text-neon-blue font-mono text-lg font-bold mb-4 flex items-center gap-2">
              <span>🎯</span> INSTRUKSI UNTUK UPT:
            </h3>
            
            <div className="space-y-4">
              {/* Step 1: Download */}
              <div className="bg-cyber-darker border-l-4 border-neon-green rounded-r p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-cyber-dark font-mono font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-neon-green font-mono font-bold mb-2">
                      DOWNLOAD KONTEN DARI GOOGLE DRIVE
                    </h4>
                    <p className="text-cyber-text font-mono text-sm mb-3">
                      Unduh semua file konten yang sudah disiapkan oleh Admin:
                    </p>
                    <button
                      onClick={handleOpenGoogleDrive}
                      className="bg-neon-green text-cyber-dark px-4 py-2 rounded font-mono font-bold
                                 hover:bg-neon-blue hover:shadow-glow-green-sm
                                 transition-all duration-300 transform hover:scale-[1.02]
                                 flex items-center gap-2"
                    >
                      <span>📁</span> OPEN GOOGLE DRIVE
                    </button>
                    <p className="text-cyber-text-dim font-mono text-xs mt-2">
                      {'>'} Link: {instruction.content_link}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload */}
              <div className="bg-cyber-darker border-l-4 border-neon-purple rounded-r p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-neon-purple rounded-full flex items-center justify-center text-cyber-dark font-mono font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-neon-purple font-mono font-bold mb-2">
                      UPLOAD KE SELURUH PLATFORM MEDIA SOSIAL
                    </h4>
                    <p className="text-cyber-text font-mono text-sm mb-3">
                      Upload konten yang sudah didownload ke <strong>semua platform</strong>:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-cyber-light/50 border border-cyber-light rounded p-2">
                        <span className="text-cyber-text font-mono text-xs">📸 Instagram</span>
                      </div>
                      <div className="bg-cyber-light/50 border border-cyber-light rounded p-2">
                        <span className="text-cyber-text font-mono text-xs">𝕏 Twitter/X</span>
                      </div>
                      <div className="bg-cyber-light/50 border border-cyber-light rounded p-2">
                        <span className="text-cyber-text font-mono text-xs">👥 Facebook</span>
                      </div>
                      <div className="bg-cyber-light/50 border border-cyber-light rounded p-2">
                        <span className="text-cyber-text font-mono text-xs">🎵 TikTok</span>
                      </div>
                      <div className="bg-cyber-light/50 border border-cyber-light rounded p-2">
                        <span className="text-cyber-text font-mono text-xs">▶️ YouTube</span>
                      </div>
                      <div className="bg-cyber-light/50 border border-cyber-light rounded p-2">
                        <span className="text-cyber-text font-mono text-xs">➕ Lainnya</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Caption Instagram */}
              <div className="bg-cyber-darker border-l-4 border-neon-pink rounded-r p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-neon-pink rounded-full flex items-center justify-center text-cyber-dark font-mono font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-neon-pink font-mono font-bold mb-2 flex items-center gap-2">
                      <span>📸</span> CAPTION INSTAGRAM
                    </h4>
                    <div className="bg-cyber-light border border-neon-pink/30 rounded p-3">
                      <pre className="text-cyber-text font-mono text-sm whitespace-pre-wrap wrap-break-word">
{instruction.caption_instagram}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(instruction.caption_instagram);
                        alert('Caption Instagram berhasil dicopy!');
                      }}
                      className="mt-2 text-neon-pink font-mono text-xs hover:text-neon-blue transition-colors flex items-center gap-1"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4: Caption Twitter */}
              <div className="bg-cyber-darker border-l-4 border-neon-blue rounded-r p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-neon-blue rounded-full flex items-center justify-center text-cyber-dark font-mono font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-neon-blue font-mono font-bold mb-2 flex items-center gap-2">
                      <span>𝕏</span> CAPTION TWITTER/X
                    </h4>
                    <div className="bg-cyber-light border border-neon-blue/30 rounded p-3">
                      <pre className="text-cyber-text font-mono text-sm whitespace-pre-wrap wrap-break-word">
{instruction.caption_twitter}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(instruction.caption_twitter);
                        alert('Caption Twitter/X berhasil dicopy!');
                      }}
                      className="mt-2 text-neon-blue font-mono text-xs hover:text-neon-pink transition-colors flex items-center gap-1"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 5: Submit Report */}
              <div className="bg-cyber-darker border-l-4 border-neon-green rounded-r p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 bg-neon-green rounded-full flex items-center justify-center text-cyber-dark font-mono font-bold">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="text-neon-green font-mono font-bold mb-2">
                      ISI FORM SUBMISSION SEPERTI BIASA
                    </h4>
                    <p className="text-cyber-text font-mono text-sm">
                      Setelah upload ke semua platform, jangan lupa isi form submission di dashboard UPT seperti biasa dengan semua link dan username yang sudah diupload.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
            <h4 className="text-yellow-400 font-mono font-bold mb-2 flex items-center gap-2">
              <span>⚠️</span> CATATAN PENTING:
            </h4>
            <ul className="text-cyber-text font-mono text-sm space-y-1 list-disc list-inside">
              <li>Platform lain (Facebook, TikTok, YouTube) gunakan caption yang sesuai</li>
              <li>Pastikan semua link dan username dicatat untuk diisi di form submission</li>
              <li>Gunakan caption yang sudah disediakan untuk konsistensi pesan</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-cyber-light border-t-2 border-neon-blue p-6 flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="bg-cyber-dark border-2 border-cyber-light text-cyber-text px-6 py-3 rounded font-mono
                       hover:border-neon-blue hover:text-neon-blue
                       transition-all duration-300"
          >
            CLOSE
          </button>
          <button
            onClick={handleMarkAsRead}
            disabled={isMarkingRead}
            className="bg-neon-blue text-cyber-dark px-6 py-3 rounded font-mono font-bold shadow-glow-blue
                       hover:bg-neon-green hover:shadow-glow-green
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMarkingRead ? 'MARKING...' : '✓ MARK AS READ'}
          </button>
        </div>
      </div>
    </div>
  );
}
