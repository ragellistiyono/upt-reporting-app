#!/usr/bin/env node
/**
 * Fix script: Seed remaining data for UPT Gresik
 * (Konten Medsos 18, Media Massa 3, Media Sosial 5, Video In-Change 3)
 */
require('dotenv').config({ path: '.env.local' });
const sdk = require('node-appwrite');

const client = new sdk.Client();
client.setEndpoint(process.env.APPWRITE_ENDPOINT).setProject(process.env.APPWRITE_PROJECT_ID).setKey(process.env.APPWRITE_API_KEY);
const databases = new sdk.Databases(client);

const DB = 'db_kinerja_upt';
const COL = 'submissions';
const uptName = 'UPT Gresik';
const userId = '69a26562002f034fbeb4';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
async function withRetry(fn, max = 3) {
  for (let i = 1; i <= max; i++) {
    try { return await fn(); }
    catch (e) { if (i === max) throw e; console.log(`  Retry ${i}/${max}...`); await delay(i * 1500); }
  }
}

function randomDate() {
  const start = new Date(2026, 0, 1), end = new Date(2026, 5, 30);
  let d;
  do { d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())); }
  while (d.getDate() === 17 || d.getDate() === 18);
  d.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
  return d;
}
function sortedDates(n) { return Array.from({length:n},()=>randomDate()).sort((a,b)=>a-b); }

const NF = {
  nomor_konten: null,
  link_instagram_1: null, username_instagram_1: null, link_instagram_2: null, username_instagram_2: null, link_instagram_3: null, username_instagram_3: null,
  link_ig_reels_1: null, username_ig_reels_1: null, link_ig_reels_2: null, username_ig_reels_2: null, link_ig_reels_3: null, username_ig_reels_3: null,
  link_twitter_1: null, username_twitter_1: null, link_twitter_2: null, username_twitter_2: null, link_twitter_3: null, username_twitter_3: null,
  link_facebook: null, username_facebook: null,
  link_threads_1: null, username_threads_1: null, link_threads_2: null, username_threads_2: null, link_threads_3: null, username_threads_3: null,
  link_youtube_1: null, username_youtube_1: null, link_youtube_2: null, username_youtube_2: null, link_youtube_3: null, username_youtube_3: null,
  link_yt_video_1: null, username_yt_video_1: null, link_yt_video_2: null, username_yt_video_2: null, link_yt_video_3: null, username_yt_video_3: null,
  link_tiktok: null, username_tiktok: null,
};

async function create(data) {
  await withRetry(() => databases.createDocument(DB, COL, sdk.ID.unique(), data));
  await delay(150);
}

const MEDIA = ['Kompas','Detik.com','Tribunnews','Tempo','CNN Indonesia','CNBC Indonesia','Republika'];

async function main() {
  console.log('Fixing UPT Gresik...\n');
  let count = 0;

  // Konten Medsos: 18
  const d1 = sortedDates(18);
  for (let i = 0; i < 18; i++) {
    await create({
      indicator_type: 'PRODUKSI KONTEN MEDIA SOSIAL UNIT', sub_category: null,
      submitted_by_upt: uptName, submission_date: d1[i].toISOString(), submitted_by_user: userId,
      title: `Konten Media Sosial ${uptName} #${i+1} - Edisi Semester 1 2026`,
      narasi: `Konten media sosial ke-${i+1} dari ${uptName}. Konten ini diproduksi untuk meningkatkan engagement dan awareness publik terhadap program-program PLN di wilayah ${uptName}.`,
      documentation_link: `https://drive.google.com/file/d/example-konten-medsos-upt-gresik-${i+1}`,
      link_media: null, link_publikasi: null, nama_media: null,
      skor_media_massa: null, skor_media_sosial: null, file_id: null, ...NF,
    });
  }
  count += 18;
  console.log('✅ Konten Media Sosial: 18');

  // Media Massa: 3
  const d2 = sortedDates(3);
  for (let i = 0; i < 3; i++) {
    const mn = MEDIA[Math.floor(Math.random() * MEDIA.length)];
    await create({
      indicator_type: 'SKORING MEDIA MASSA DAN MEDIA SOSIAL', sub_category: 'MEDIA MASSA',
      submitted_by_upt: uptName, submission_date: d2[i].toISOString(), submitted_by_user: userId,
      title: `Pemberitaan PLN ${uptName} di ${mn} #${i+1}`,
      narasi: null, documentation_link: null, link_media: null,
      link_publikasi: `https://www.${mn.toLowerCase().replace(/\s+/g,'')}.com/pln-upt-gresik-${i+1}`,
      nama_media: mn,
      skor_media_massa: null, skor_media_sosial: null, file_id: null, ...NF,
    });
  }
  count += 3;
  console.log('✅ Media Massa: 3');

  // Media Sosial: 5 (skor 500 each = 2500 total)
  const d3 = sortedDates(5);
  for (let i = 0; i < 5; i++) {
    await create({
      indicator_type: 'SKORING MEDIA MASSA DAN MEDIA SOSIAL', sub_category: 'MEDIA SOSIAL',
      submitted_by_upt: uptName, submission_date: d3[i].toISOString(), submitted_by_user: userId,
      title: null, narasi: null, documentation_link: null, link_media: null,
      link_publikasi: null, nama_media: null,
      skor_media_massa: null, skor_media_sosial: 500, file_id: null, ...NF,
    });
  }
  count += 5;
  console.log('✅ Media Sosial: 5 (skor=2500)');

  // Video In-Change: 3
  const d4 = sortedDates(3);
  for (let i = 0; i < 3; i++) {
    await create({
      indicator_type: 'KONTEN VIDEO IN-CHANGE', sub_category: null,
      submitted_by_upt: uptName, submission_date: d4[i].toISOString(), submitted_by_user: userId,
      title: `Video In-Change ${uptName} #${i+1} - Program Kelistrikan 2026`,
      narasi: null, documentation_link: null,
      link_media: `https://www.youtube.com/watch?v=example-video-upt-gresik-${i+1}`,
      link_publikasi: null, nama_media: null,
      skor_media_massa: null, skor_media_sosial: null, file_id: null, ...NF,
    });
  }
  count += 3;
  console.log('✅ Video In-Change: 3');

  console.log(`\nDone! Created ${count} docs for ${uptName}`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
