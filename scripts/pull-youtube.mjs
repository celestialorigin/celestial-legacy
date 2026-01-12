import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FEEDS_PATH = path.join(__dirname, '../src/data/feeds.json');
const UPDATES_PATH = path.join(__dirname, '../src/data/updates.json');

const TEMPLATE = "音響信号を受信。同期を開始。";

async function getChannelId(handleUrl) {
    try {
        const res = await fetch(handleUrl);
        const html = await res.text();
        const match = html.match(/itemprop="channelId" content="(.*?)"/);
        return match ? match[1] : null;
    } catch (e) {
        console.error('Error fetching channel ID:', e);
        return null;
    }
}

async function fetchRss(channelId) {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        const res = await fetch(url);
        const xml = await res.text();

        const entries = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;

        while ((match = entryRegex.exec(xml)) !== null) {
            const content = match[1];
            const videoId = content.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
            const title = content.match(/<title>(.*?)<\/title>/)?.[1];
            const published = content.match(/<published>(.*?)<\/published>/)?.[1];

            if (videoId && title && published) {
                entries.push({
                    id: `ST-${published.split('T')[0].replace(/-/g, '')}-${videoId.slice(0, 4)}`,
                    category: "SONIC",
                    date: published.split('T')[0],
                    title,
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    message: TEMPLATE,
                    source: "youtube"
                });
            }
        }
        return entries;
    } catch (e) {
        console.error('Error fetching RSS:', e);
        return [];
    }
}

async function main() {
    console.log('--- YouTube Feed Pull Start ---');

    if (!fs.existsSync(FEEDS_PATH)) {
        console.error('feeds.json not found');
        return;
    }

    const feeds = JSON.parse(fs.readFileSync(FEEDS_PATH, 'utf-8'));
    const channelId = await getChannelId(feeds.youtubeHandleUrl);

    if (!channelId) {
        console.error('Could not find channel ID');
        return;
    }

    console.log(`Channel ID identified: ${channelId}`);
    const newEntries = await fetchRss(channelId);

    let currentUpdates = [];
    if (fs.existsSync(UPDATES_PATH)) {
        currentUpdates = JSON.parse(fs.readFileSync(UPDATES_PATH, 'utf-8'));
    }

    const existingUrls = new Set(currentUpdates.map(u => u.url));
    const uniqueNew = newEntries.filter(e => !existingUrls.has(e.url));

    if (uniqueNew.length > 0) {
        const combined = [...uniqueNew, ...currentUpdates]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 50); // Keep last 50

        fs.writeFileSync(UPDATES_PATH, JSON.stringify(combined, null, 2));
        console.log(`Added ${uniqueNew.length} new entries.`);
    } else {
        console.log('No new entries found.');
    }

    console.log('--- YouTube Feed Pull End ---');
}

main();
