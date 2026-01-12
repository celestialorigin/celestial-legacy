# Design: Live Observation System (Automated Stream Detection)

## A) Implementation Phases (YouTube / Twitch)

### v0: Manual Control (Reliable Fallback)
The safest starting point. No automation failures, but requires manual file editing (or logic derived from `signals.json` if we treat live streams as "signals").

- **Logic:** Manually set `isLive: true` and `videoId/channelId` in a config file.
- **Pros:** 100% reliable, zero API limits.
- **Cons:** Human intervention required to start/stop "Observation".

### v1: Semi-Automated (Low-Cost / RSS / Page Parsing)
Attempts to detect streams without heavy API usage.

- **YouTube:** 
  - **Method:** Fetch the channel page HTML (`https://www.youtube.com/@channel/live`) or use specialized RSS.
  - **Risk:** High chance of being blocked by Google (HTML parsing). RSS often lags or doesn't show active functionality reliably.
- **Twitch:**
  - **Method:** Technically difficult without API. Scraping Twitch is hostile.
  - **Verdict:** Skip v1 for Twitch.

### v2: Fully Automated (API Integration)
The target for "Observation OS".

- **YouTube (Data API v3):**
  - **Method:** `GET /search?part=snippet&eventType=live&type=video&channelId=...`
  - **Quota Cost:** High (100 units per search). A free tier (10k/day) allows ~100 checks/day (every ~15 mins).
  - **Auth:** API Key (via secrets).
- **Twitch (Helix API):**
  - **Method:** `GET /helix/streams?user_id=...`
  - **Quota Cost:** Very generous.
  - **Auth:** OAuth App Token (Client ID + Secret). Requires a token fetch step (Client Credentials Flow).

---

## B) Data Structure Design

### `src/data/live_status.json`
Independent from `signals.json` to separate "Real-time State" from "Event Logs".

```json
{
  "status": "online", // "online" | "offline"
  "platform": "twitch", // "youtube" | "twitch" | null
  "lastChecked": "2026-01-12T14:30:00Z",
  "channelId": "UC_xxxx", // or Twitch username
  "embedId": "12345678", // videoId (YT) or username (Twitch)
  "title": "Stream Title",
  "viewerCount": 120, // Optional metadata
  "link": "https://..."
}
```

### Environment Variables
```bash
# YouTube
YOUTUBE_API_KEY=...
YOUTUBE_CHANNEL_ID=...

# Twitch
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
TWITCH_USER_ID=... # or username

# System
ENABLE_LIVE_CHECK=true
```

---

## C) Detection Logic Comparison

| Feature | YouTube (Data API) | Twitch (Helix API) |
| :--- | :--- | :--- |
| **Endpoint** | `search.list` (eventType=live) | `streams` (user_login=name) |
| **Reliability** | High | Very High |
| **Quota/Rate** | Strict (10k units/day). Search cost=100. Max 100 checks/day. | Generous (800 requests/min). |
| **Auth** | Simple API Key | OAuth (Client Creds Flow) |
| **Delay** | Low | Low |
| **Embed** | `iframe src=".../embed/{id}"` | `iframe src="...?channel={id}&parent={domain}"` |
| **Parent Param** | Not required | **Required** (Must match site domain) |

**Note on Twitch `parent` parameter:**
Since the site will run on `localhost` (dev), `vercel.app` (staging), and a custom domain (prod), the embed URL generator must handle this:
`src="https://player.twitch.tv/?channel=Lukia&parent=localhost&parent=celestial.void..."`
It accepts multiple parent parameters.

---

## D) CI/CD Automation Strategy

### Workflow: `check-live.yml`
- **Schedule:** Cron every **15 minutes** (0, 15, 30, 45).
  - *Reason:* 15 mins is a balance between "freshness" and "YouTube API Quota limits" (96 runs/day < 100 limit).
- **Script:** `scripts/check-live.ts`
- **Logic:**
  1. Load IDs/Keys from Envs.
  2. **Twitch Check (First):** Cheap/Fast. If online -> update JSON -> Commit -> Exit.
  3. **YouTube Check (Second):** Expensive. Only run if Twitch is offline. If online -> update JSON -> Commit.
  4. If both offline -> Set status "offline" -> Commit (only if changed).
- **Failure Handling:**
  - If API fails, log generic error ("NOISE"). Do NOT overwrite "online" status comfortably (prevent false offline during blips).
  - Keep previous state if check fails? Or assume offline? -> **Safest:** Assume offline if API error persists > 1 run.

---

## E) `/real-time` Display Specification

### UI States
1.  **OFFLINE (Default)**
    - Display: "NO SIGNAL DETECTED" (Scanning animation).
    - Shi-chan: "しぃ！（観測待機中...）"
2.  **ONLINE (YouTube)**
    - Display: Large Iframe (`width: 100%, aspect-ratio: 16/9`).
    - Overlay/Badge: [LIVE SIGNAL: YOUTUBE]
    - Shi-chan: "しぃ！（映像信号を受信！）"
3.  **ONLINE (Twitch)**
    - Display: Large Iframe.
    - Overlay/Badge: [LIVE SIGNAL: TWITCH]
    - **Important:** Ensure `parent` param includes valid domains.

### Component Structure
```astro
<!-- RealTimePlayer.astro -->
{status === 'online' ? (
  <div class="live-monitor">
    <div class="monitor-frame">
      {platform === 'youtube' && <YouTubeEmbed id={embedId} />}
      {platform === 'twitch' && <TwitchEmbed channel={embedId} />}
    </div>
    <div class="live-meta">
      <span class="badge blink">LIVE</span>
      <span class="title">{title}</span>
    </div>
  </div>
) : (
  <div class="offline-noise">...</div>
)}
```

---

## Recommended Roadmap

**Step 1: The "Twitch-First" Approach (v2 for Twitch, v0 for YouTube)**
- **Why?** Twitch API is much easier to automate frequently without cost fears. YouTube API quota is the bottleneck for frequent polling (every 15 min).
- **Plan:**
  1. Implement `scripts/check-live.ts` with **Twitch Helix support** immediately.
  2. For YouTube, leave it as a manual "Signal" or config entry for now (or implement API check but run it less frequently/manually).
  3. Set up the GitHub Action to run every 15 mins.

**Step 2: "Hybrid" Polling**
- Once Step 1 is stable, add YouTube API logic but be careful with the cron schedule.
- Alternatively, use **RSS** for YouTube just to detect "activity" (upload/scheduled stream) and trigger a one-time API check, saving quota.
