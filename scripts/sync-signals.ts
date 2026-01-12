import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';
import { fileURLToPath } from 'url';

// Load env
dotenv.config();

// Types (Importing locally to avoid ts-node issues if types file isn't compiled yet, 
// strictly mirroring src/types/signal.ts for script usage)
type SourceType = 'youtube' | 'kakuyomu' | 'manual' | 'noise';
type KindType = 'video' | 'novel' | 'post' | 'stream' | 'note';

interface SignalNarrative {
    header: string;
    lines: string[];
}

interface SignalMedia {
    embed?: string;
    thumb?: string;
}

interface Signal {
    id: string;
    source: SourceType;
    kind: KindType;
    title: string;
    date: string; // ISO8601
    url: string;
    media: SignalMedia;
    auto: boolean;
    observer: string;
    template: string;
    narrative: SignalNarrative;
}

// Config
const ENABLE_SYNC = process.env.ENABLE_SYNC === 'true';
const ENABLE_X_POST = process.env.ENABLE_X_POST === 'true'; // Default OFF
const YOUTUBE_RSS_URL = process.env.YOUTUBE_RSS_URL;
// const KAKUYOMU_FEED_URL = process.env.KAKUYOMU_FEED_URL; // Placeholder for now

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIGNALS_PATH = path.join(__dirname, '../src/data/signals.json');

// Connector Interfaces
interface ConnectorResult {
    signals: Signal[];
    errors: { source: string; reason: any; time: string }[];
}

// Helper: Generate ID
function generateId(source: string, dateStr: string, seq: string | number): string {
    const date = new Date(dateStr);
    const yaaa = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `sig-${source}-${yaaa}${mm}${dd}-${seq}`;
}

// Helper: Create Narrative
function createNarrative(source: string, kind: string, title: string, url: string): SignalNarrative {
    return {
        header: "OBSERVATION SIGNAL RECEIVED",
        lines: [
            "外界信号を受信。",
            "記録を開始します。",
            `観測チャネル：${source.toUpperCase()}`,
            `対象：${kind.toUpperCase()}`,
            `座標：<${url}>`
        ]
    };
}

// YouTube Connector
async function fetchYouTubeSignals(): Promise<ConnectorResult> {
    const results: ConnectorResult = { signals: [], errors: [] };

    if (!YOUTUBE_RSS_URL) {
        console.log('[YouTube Connector] No YOUTUBE_RSS_URL found. Skipping.');
        return results;
    }

    const parser = new Parser();
    try {
        const feed = await parser.parseURL(YOUTUBE_RSS_URL);

        // Process items
        for (const item of feed.items) {
            // YouTube RSS Specifics:
            // item.id -> videoId normally "yt:video:VIDEO_ID"
            // item.link -> video URL
            // item.pubDate -> date
            // item.title -> title

            const videoId = item.id?.replace('yt:video:', '') || item.link?.split('v=')[1];
            if (!videoId || !item.isoDate) continue;

            const sig: Signal = {
                id: `yt-${videoId}`, // Use Video ID as unique key for existing check
                source: 'youtube',
                kind: 'video',
                title: item.title || 'Untitled',
                date: item.isoDate,
                url: item.link || `https://www.youtube.com/watch?v=${videoId}`,
                media: {
                    embed: `https://www.youtube.com/embed/${videoId}`,
                    thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                },
                auto: true,
                observer: 'Lukia', // Automated observer name
                template: 'SIGNAL',
                narrative: createNarrative('youtube', 'video', item.title || 'Untitled', item.link || '')
            };

            // Override ID format to standard AFTER duplication check usage? 
            // Actually we need consistent ID for deduplication. 
            // Let's use `sig-youtube-{date}-{videoIdSuffix}` roughly, OR just keep custom ID logic internally?
            // User requested `sig-<source>-<yyyymmdd>-<seq>` format.
            // But for dedupe, we need to know "is this video already in?".
            // Strategy: We will check URL or Source-ID uniqueness.
            // We will generate the FINAL display ID later if new.

            results.signals.push(sig);
        }

    } catch (error) {
        results.errors.push({ source: 'youtube', reason: error, time: new Date().toISOString() });
        console.error('[YouTube Connector] Error fetching RSS:', error);
    }

    return results;
}

// Kakuyomu Connector (Skeleton / Manual for now)
async function fetchKakuyomuSignals(): Promise<ConnectorResult> {
    // Placeholder logic for v0.1 - Extendable later
    return { signals: [], errors: [] };
}

// Main Sync Function
async function main() {
    console.log('--- STARTING SIGNAL SYNC ---');

    // 1. Safety Check
    if (!ENABLE_SYNC) {
        console.log('[SAFETY] ENABLE_SYNC is false. Aborting sync.');
        return;
    }

    // 2. Load Existing Signals
    let existingSignals: Signal[] = [];
    try {
        const data = await fs.readFile(SIGNALS_PATH, 'utf-8');
        existingSignals = JSON.parse(data);
    } catch (e) {
        console.log('[INFO] No existing signals.json or read error. Creating new database.');
        existingSignals = [];
    }

    // 3. Fetch New Signals
    const ytResult = await fetchYouTubeSignals();
    const kakuyomuResult = await fetchKakuyomuSignals();

    const fetchedSignals = [...ytResult.signals, ...kakuyomuResult.signals];
    const allErrors = [...ytResult.errors, ...kakuyomuResult.errors];

    // 4. Log Errors (NOISE candidate)
    if (allErrors.length > 0) {
        console.warn('[WARNING] Some connectors failed:', allErrors);
        // Future: Write to noise log
    }

    // 5. Merge & Deduplicate
    // Strategy: Check if URL already exists in existingSignals
    let newCount = 0;
    const currentUrls = new Set(existingSignals.map(s => s.url));

    const finalSignals = [...existingSignals];

    for (const sig of fetchedSignals) {
        if (currentUrls.has(sig.url)) {
            continue; // Duplicate found
        }

        // It's New!
        // Format ID now: sig-<source>-<yyyymmdd>-<seq>
        // Seq needs to be unique for that day.
        const dateObj = new Date(sig.date);
        const yyyymmdd = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
        const todayCount = finalSignals.filter(s => s.id.includes(`-${yyyymmdd}-`)).length;

        // Re-format the ID strictly before pushing
        sig.id = `sig-${sig.source}-${yyyymmdd}-${String(todayCount + 1).padStart(3, '0')}`;

        finalSignals.push(sig);
        newCount++;
        console.log(`[NEW] Added signal: ${sig.title} (${sig.source})`);

        // X Post Hook (Skeleton)
        if (ENABLE_X_POST) {
            console.log(`[X-POST (MOCK)] Would post: ${sig.title} -> ${sig.url}`);
            // Implementation of actual API call goes here later
        }
    }

    if (newCount === 0) {
        console.log('[INFO] No new signals found.');
    } else {
        // 6. Sort (Date Descending)
        finalSignals.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 7. Save
        await fs.writeFile(SIGNALS_PATH, JSON.stringify(finalSignals, null, 2), 'utf-8');
        console.log(`[SUCCESS] Saved ${finalSignals.length} signals (${newCount} new).`);
    }

    console.log('--- SYNC COMPLETE ---');
}

main().catch(err => {
    console.error('[FATAL] Script failed:', err);
    process.exit(1);
});
