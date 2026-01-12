import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, templates } from './config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, '../src/data/updates.json');

async function pullYouTube(channelId, category) {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        const res = await fetch(url);
        const xml = await res.text();

        // 簡易的なXMLパース（正規表現）
        const entries = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;

        while ((match = entryRegex.exec(xml)) !== null) {
            const content = match[1];
            const id = content.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
            const title = content.match(/<title>(.*?)<\/title>/)?.[1];
            const published = content.match(/<published>(.*?)<\/published>/)?.[1];
            const videoUrl = `https://www.youtube.com/watch?v=${id}`;

            if (id && title && published) {
                entries.push({
                    id: `${category}-${id}`,
                    category,
                    date: published.split('T')[0],
                    title,
                    url: videoUrl,
                    message: templates[category],
                    source: 'youtube'
                });
            }
        }
        return entries;
    } catch (e) {
        console.error(`YouTube Error [${category}]:`, e);
        return [];
    }
}

// カクヨム、pixivなどは今はサンプルとしてスタブ実装
async function pullKakuyomu() {
    // 本来はスクレイピングやRSSHubなどを使用
    return [];
}

async function pullPixiv() {
    // 本来はRSSHubなどを使用
    return [];
}

async function main() {
    console.log('--- START PULL FEEDS ---');

    let currentData = [];
    if (fs.existsSync(DATA_PATH)) {
        currentData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }

    const newLogs = [];

    // YouTube
    for (const yt of config.youtube) {
        if (yt.id && !yt.id.includes('PLACEHOLDER')) {
            const logs = await pullYouTube(yt.id, yt.category);
            newLogs.push(...logs);
        }
    }

    // その他 (TODO: 実装)
    newLogs.push(...await pullKakuyomu());
    newLogs.push(...await pullPixiv());

    // 重複排除 (URLベース)
    const existingUrls = new Set(currentData.map(item => item.url));
    const filteredNewLogs = newLogs.filter(log => !existingUrls.has(log.url));

    // 合体してソート（日付降順）
    const combined = [...filteredNewLogs, ...currentData]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, config.maxItemsPerCategory * 4); // 全体上限

    fs.writeFileSync(DATA_PATH, JSON.stringify(combined, null, 2));

    console.log(`Updated updates.json: ${filteredNewLogs.length} new items added.`);
    console.log('--- END PULL FEEDS ---');
}

main();
