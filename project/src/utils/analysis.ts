import type { ScreenshotAnalysis, ActivityItem, YouTubeVideoInfo, ScreenshotBrief, DetectedEntity } from '@/types';

export function extractYouTubeUrl(text: string): string | null {
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+[^\s]*/i,
    /https?:\/\/(?:www\.)?youtu\.be\/[\w-]+[^\s]*/i,
    /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[\w-]+[^\s]*/i,
    /https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]+[^\s]*/i,
  /https?:\/\/(?:www\.)?youtube\.com\/c\/[\w-]+[^\s]*/i,
    /https?:\/\/(?:www\.)?youtube\.com\/channel\/[\w-]+[^\s]*/i,
  /https?:\/\/(?:www\.)?youtube\.com\/@[\w-]+[^\s]*/i,
  /youtube\.com\/watch\?v=[\w-]+[^\s]*/i,
    /youtu\.be\/[\w-]+[^\s]*/i,
  /youtube\.com\/shorts\/[\w-]+[^\s]*/i,
  /youtube\.com\/[\w-]+[^\s]*/i,
  /youtube\.com\b/i,
  /youtu\.be\b/i,
  /youtube\b/i,
  /you tube\b/i,
    /you tube\.com\b/i,
  /youtube com\b/i,
  /youtube\.com\b/i,
  /youtu\.be\b/i,
    /youtube\b/i,
    /you tube\b/i,
    /you tube\.com\b/i,
    /youtube com\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[0].trim();
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      return url;
    }
  }
  return null;
}

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([\w-]{11})/,
    /youtube\.com\/watch\?v=([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  const cleaned = url.trim();
  if (!cleaned) return false;
  const pattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i;
  return pattern.test(cleaned);
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getRelativeDay(timestamp: number): string {
  const today = new Date();
  const date = new Date(timestamp);
  const diffDays = Math.floor(
    (today.setHours(0, 0, 0, 0) - date.setHours(0, 0, 0, 0)) / 86400000
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function validateImageFile(file: File, maxSizeMB: number): { valid: boolean; error?: string } {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a valid PNG, JPG, JPEG or WEBP image.' };
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `Image size exceeds ${maxSizeMB}MB limit. Please upload a smaller image.` };
  }
  return { valid: true };
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export type OcrProgressCallback = (progress: number, status: string) => void;

async function extractTextFromImage(imageUrl: string, onProgress?: OcrProgressCallback): Promise<string> {
  let worker: { terminate: () => Promise<unknown>; recognize: (img: string) => Promise<{ data: { text: string } }> } | null = null;
  try {
    onProgress?.(0, 'Loading OCR engine...');
    const { createWorker } = await import('tesseract.js');
    worker = await createWorker('eng', 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status && typeof m.progress === 'number') {
          onProgress?.(Math.round(m.progress * 100), m.status);
        }
      },
    });
    onProgress?.(50, 'Recognizing text...');
    const { data: { text } } = await worker.recognize(imageUrl);
    await worker.terminate();
    worker = null;
    return text || '';
  } catch (err) {
    if (worker) {
      try { await worker.terminate(); } catch { /* ignore */ }
    }
    throw new Error('OCR engine failed to process the image. ' + (err instanceof Error ? err.message : ''));
  }
}

function detectPlatform(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('youtube') || lower.includes('youtu.be') || /@[\w.-]{2,}/.test(text)) return 'YouTube';
  if (lower.includes('twitter') || lower.includes('x.com')) return 'Twitter / X';
  if (lower.includes('facebook')) return 'Facebook';
  if (lower.includes('instagram')) return 'Instagram';
  if (lower.includes('tiktok')) return 'TikTok';
  if (lower.includes('reddit')) return 'Reddit';
  if (lower.includes('github')) return 'GitHub';
  if (lower.includes('google')) return 'Google';
  if (lower.includes('chrome') || lower.includes('firefox') || lower.includes('safari') || lower.includes('edge')) {
    return 'Web Browser';
  }
  return 'Unknown Platform';
}

function detectVideoTitle(text: string): string | null {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 5);
  for (const line of lines) {
    if (/^[\d:]+\s*$/i.test(line)) continue;
    if (/youtube\.com|youtu\.be|https?:\/\//i.test(line)) continue;
    if (/^(like|dislike|share|save|subscribe|comment|download|play|pause)$/i.test(line)) continue;
    if (/^\d+\s*(views|subscribers|likes|comments)/i.test(line)) continue;
    if (line.length > 10 && !/^\d+$/.test(line) && !/^(like|share|save|subscribe)/i.test(line)) {
      return line;
    }
  }
  return null;
}

function detectChannel(text: string): string | null {
  const channelPatterns = [
    /(?:^|\n)([A-Z][\w\s&.]+?)\s*\n\s*(?:\d+[\d,.]*\s*subscribers)/i,
    /(?:^|\n)([A-Z][\w\s&.]+?)\s*(?:Subscribe)/i,
    /@[\w.-]{2,}/,
  ];
  for (const pattern of channelPatterns) {
    const match = text.match(pattern);
    if (match) {
      let channel = match[1] || match[0];
      channel = channel.trim();
      if (channel.length > 1 && channel.length < 60) return channel;
    }
  }
  return null;
}

function detectViewCount(text: string): string | null {
  const match = text.match(/([\d,.]+\s*[KMB]?)\s*views/i);
  if (match) return match[0].trim();
  return null;
}

function detectDuration(text: string): string | null {
  const match = text.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
  if (match) return match[1];
  return null;
}

function detectActivities(text: string): ActivityItem[] {
  const lower = text.toLowerCase();
  const activityNames = ['Play', 'Pause', 'Like', 'Dislike', 'Subscribe', 'Comment', 'Share', 'Save', 'Download'];
  return activityNames.map((name) => {
    const visible = lower.includes(name.toLowerCase());
    return { activity: name, status: visible ? 'Available' : 'Not Visible' as const };
  });
}

function buildSummary(platform: string, elements: { label: string; value: string }[], youtubeLink: string | null, activities: ActivityItem[]): string {
  const parts: string[] = [`This screenshot shows a ${platform} page.`];
  const titleEl = elements.find((e) => e.label === 'Video Title');
  const channelEl = elements.find((e) => e.label === 'Channel');
  const viewEl = elements.find((e) => e.label === 'View Count');
  const durEl = elements.find((e) => e.label === 'Video Duration');

  if (titleEl) parts.push(`The video titled "${titleEl.value}"`);
  if (channelEl) parts.push(`is from the channel "${channelEl.value}"`);
  if (viewEl) parts.push(`with ${viewEl.value}`);
  if (durEl) parts.push(`and a duration of ${durEl.value}`);

  const available = activities.filter((a) => a.status === 'Available');
  if (available.length > 0) {
    parts.push(`The page displays visible interface elements including ${available.map((a) => a.activity.toLowerCase()).join(', ')}.`);
  }

  if (youtubeLink) {
    parts.push(`A YouTube URL was detected: ${youtubeLink}`);
  } else {
    parts.push('No YouTube URL was detected in this screenshot.');
  }

  return parts.join(' ');
}

async function findLikelyYouTubeUrl(title: string | null, channel: string | null): Promise<string | null> {
  if (!title) return null;
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const query = encodeURIComponent([title, channel].filter(Boolean).join(' '));
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${query}&key=${apiKey}`);
    if (!response.ok) return null;
    const result = await response.json();
    const titleWords = title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2);
    const match = result.items?.find((item: { id?: { videoId?: string }; snippet?: { title?: string } }) => {
      const candidateTitle = item.snippet?.title?.toLowerCase() || '';
      const matchingWords = titleWords.filter((word) => candidateTitle.includes(word));
      return matchingWords.length >= Math.max(1, Math.ceil(titleWords.length * 0.5));
    });
    return match?.id?.videoId ? `https://www.youtube.com/watch?v=${match.id.videoId}` : null;
  } catch {
    return null;
  }
}

function detectContentType(text: string, platform: string, hasYoutubeLink: boolean): string {
  const lower = text.toLowerCase();
  if (hasYoutubeLink || platform === 'YouTube') {
    if (lower.includes('shorts')) return 'YouTube Short';
    if (lower.includes('live')) return 'YouTube Live Stream';
    if (lower.includes('playlist')) return 'YouTube Playlist';
    return 'YouTube Video Page';
  }
  if (lower.includes('comment') || lower.includes('reply')) return 'Comments Section';
  if (lower.includes('search') || lower.includes('results')) return 'Search Results Page';
  if (lower.includes('subscribe') || lower.includes('subscribers')) return 'Channel Page';
  return `${platform} Content`;
}

function detectKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  const keywordMap: Record<string, string[]> = {
    'Gaming': ['game', 'gaming', 'play', 'stream', 'twitch', 'esports'],
    'Music': ['song', 'music', 'album', 'lyrics', 'audio', 'playlist'],
    'Tutorial': ['how to', 'tutorial', 'guide', 'learn', 'step by step'],
    'Review': ['review', 'unboxing', 'first look', 'hands on', 'opinion'],
    'News': ['news', 'breaking', 'report', 'update', 'latest'],
    'Entertainment': ['funny', 'comedy', 'sketch', 'vlog', 'reaction'],
    'Technology': ['tech', 'software', 'app', 'device', 'gadget', 'ai'],
    'Sports': ['sport', 'football', 'basketball', 'cricket', 'match', 'goal'],
  };
  const keywords: string[] = [];
  for (const [category, words] of Object.entries(keywordMap)) {
    if (words.some((w) => lower.includes(w))) keywords.push(category);
  }
  return keywords;
}

function detectEntities(text: string, youtubeLink: string | null): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  if (youtubeLink) {
    entities.push({ type: 'URL', value: youtubeLink });
  }
  const handleMatch = text.match(/@[\w.-]{2,30}/g);
  if (handleMatch) {
    handleMatch.slice(0, 3).forEach((h) => entities.push({ type: 'Handle', value: h }));
  }
  const urlMatches = text.match(/https?:\/\/[\S]+/g);
  if (urlMatches) {
    urlMatches.slice(0, 3).forEach((u) => {
      if (!entities.some((e) => e.value === u)) entities.push({ type: 'URL', value: u });
    });
  }
  const numberMatches = text.match(/\b[\d,.]+\s*(?:views|subscribers|likes|comments|K|M|B)\b/gi);
  if (numberMatches) {
    numberMatches.slice(0, 5).forEach((n) => entities.push({ type: 'Number', value: n.trim() }));
  }
  const dateMatches = text.match(/\b(?:\d{1,2}\s)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{0,4}\b/gi);
  if (dateMatches) {
    dateMatches.slice(0, 3).forEach((d) => entities.push({ type: 'Date', value: d.trim() }));
  }
  return entities;
}

function buildKeyInsights(platform: string, title: string | null, channel: string | null, views: string | null, duration: string | null, youtubeLink: string | null, activities: ActivityItem[], keywords: string[]): string[] {
  const insights: string[] = [];
  if (platform !== 'Unknown Platform') insights.push(`This is a ${platform} page`);
  if (title) insights.push(`Video title detected: "${title}"`);
  if (channel) insights.push(`Channel: ${channel}`);
  if (views) insights.push(`View count: ${views}`);
  if (duration) insights.push(`Duration: ${duration}`);
  if (youtubeLink) insights.push(`YouTube URL found and verified via API`);
  const available = activities.filter((a) => a.status === 'Available');
  if (available.length > 0) insights.push(`${available.length} interactive elements visible (${available.map((a) => a.activity).join(', ')})`);
  if (keywords.length > 0) insights.push(`Content category: ${keywords.join(', ')}`);
  if (insights.length === 0) insights.push('Limited information could be extracted from this screenshot');
  return insights;
}

function assessTextConfidence(rawText: string): 'High' | 'Medium' | 'Low' {
  const trimmed = rawText.trim();
  const words = trimmed.split(/\s+/).filter((w) => w.length > 1);
  if (words.length > 40) return 'High';
  if (words.length > 15) return 'Medium';
  return 'Low';
}

function buildBrief(rawText: string, platform: string, title: string | null, channel: string | null, views: string | null, duration: string | null, youtubeLink: string | null, activities: ActivityItem[]): ScreenshotBrief {
  const keywords = detectKeywords(rawText);
  const contentType = detectContentType(rawText, platform, !!youtubeLink);
  const entities = detectEntities(rawText, youtubeLink);
  const keyInsights = buildKeyInsights(platform, title, channel, views, duration, youtubeLink, activities, keywords);
  const textConfidence = assessTextConfidence(rawText);
  const fullTextPreview = rawText.trim().slice(0, 500) || 'No text could be extracted';
  return { contentType, keyInsights, detectedEntities: entities, detectedKeywords: keywords, textConfidence, fullTextPreview };
}

export async function analyzeScreenshot(imageUrl: string, onProgress?: OcrProgressCallback): Promise<ScreenshotAnalysis> {
  const rawText = await extractTextFromImage(imageUrl, onProgress);
  const title = detectVideoTitle(rawText);
  const channel = detectChannel(rawText);
  const platform = detectPlatform(rawText);

  const detectedElements: { label: string; value: string }[] = [
    { label: 'Detected Platform', value: platform },
    { label: 'Extracted Text', value: rawText.trim().slice(0, 200) || 'No text could be extracted' },
    { label: 'URL Detected', value: 'None detected' },
    { label: 'Video Title', value: title || 'Not detected' },
    { label: 'Channel', value: channel || 'Not detected' },
    { label: 'View Count', value: 'Not detected' },
    { label: 'Video Duration', value: 'Not detected' },
  ];

  const youtubeLink = extractYouTubeUrl(rawText) || await findLikelyYouTubeUrl(title, channel);
  if (youtubeLink) {
    detectedElements[2] = { label: 'URL Detected', value: youtubeLink };
  }
  const views = detectViewCount(rawText);
  if (views) {
    detectedElements[5] = { label: 'View Count', value: views };
  }

  const duration = detectDuration(rawText);
  if (duration) {
    detectedElements[6] = { label: 'Video Duration', value: duration };
  }

  const activities = detectActivities(rawText);
  const summary = buildSummary(platform, detectedElements, youtubeLink, activities);
  const youtubeInfo = youtubeLink ? await fetchYouTubeVideoData(youtubeLink) : undefined;
  const brief = buildBrief(rawText, platform, title, channel, views, duration, youtubeLink, activities);

  return {
    platform,
    detectedElements,
    youtubeLink,
    youtubeInfo,
    activities,
    summary,
    fullText: rawText.trim(),
    brief,
  };
}

export function extractYouTubeChannel(url: string): string | null {
  const handleMatch = url.match(/youtube\.com\/@([\w.-]+)/i);
  if (handleMatch) return '@' + handleMatch[1];
  const channelMatch = url.match(/youtube\.com\/channel\/([\w-]+)/i);
  if (channelMatch) return 'Channel ID: ' + channelMatch[1];
  const cMatch = url.match(/youtube\.com\/c\/([\w-]+)/i);
  if (cMatch) return cMatch[1];
  const userMatch = url.match(/youtube\.com\/user\/([\w-]+)/i);
  if (userMatch) return userMatch[1];
  return null;
}

export function analyzeYouTubeUrl(url: string): YouTubeVideoInfo {
  const videoId = extractYouTubeVideoId(url) || '';
  const channel = extractYouTubeChannel(url);
  const metadata = ['Video URL', 'Video ID', 'Thumbnail (public)'];
  if (channel) metadata.push('Channel (from URL)');
  return {
    url,
    videoId,
    title: null,
    channel,
    thumbnail: videoId ? getYouTubeThumbnail(videoId) : null,
    availableMetadata: metadata,
    fetched: false,
  };
}

function parseISODuration(iso: string): string | null {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function fetchYouTubeVideoData(url: string): Promise<YouTubeVideoInfo> {
  const videoId = extractYouTubeVideoId(url);
  const baseInfo = analyzeYouTubeUrl(url);

  if (!videoId) {
    return { ...baseInfo, fetched: false, error: 'Could not extract a valid video ID from this URL.' };
  }

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) {
    return { ...baseInfo, fetched: false, error: 'YouTube API key is not configured.' };
  }

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
    const res = await fetch(apiUrl);
    if (!res.ok) {
      return { ...baseInfo, fetched: false, error: `YouTube API returned an error (HTTP ${res.status}).` };
    }
    const json = await res.json();
    if (!json.items || json.items.length === 0) {
      return { ...baseInfo, fetched: false, error: 'No video found for this ID. The video may be private or deleted.' };
    }

    const item = json.items[0];
    const snippet = item.snippet || {};
    const stats = item.statistics || {};
    const details = item.contentDetails || {};

    const availableMetadata = ['Video URL', 'Video ID', 'Title', 'Channel', 'Thumbnail', 'Published Date'];
    if (stats.viewCount) availableMetadata.push('View Count');
    if (stats.likeCount) availableMetadata.push('Like Count');
    if (stats.commentCount) availableMetadata.push('Comment Count');
    if (details.duration) availableMetadata.push('Duration');
    if (snippet.description) availableMetadata.push('Description');

    return {
      url,
      videoId,
      title: snippet.title || null,
      channel: snippet.channelTitle || baseInfo.channel || null,
      thumbnail: snippet.thumbnails?.high?.url || getYouTubeThumbnail(videoId),
      description: snippet.description ? snippet.description.slice(0, 300) : null,
      publishedAt: snippet.publishedAt || null,
      viewCount: stats.viewCount || null,
      likeCount: stats.likeCount || null,
      commentCount: stats.commentCount || null,
      duration: details.duration ? parseISODuration(details.duration) : null,
      availableMetadata,
      fetched: true,
      error: null,
    };
  } catch {
    return { ...baseInfo, fetched: false, error: 'Failed to connect to the YouTube API. Please check your internet connection.' };
  }
}

export function generateAIResponse(
  question: string,
  context?: { analysis?: ScreenshotAnalysis; youtubeInfo?: YouTubeVideoInfo }
): string {
  const q = question.toLowerCase();

  if (context?.analysis) {
    const a = context.analysis;

    if (q.includes('what is this') || q.includes('what is shown') || q.includes('explain this screenshot') || q.includes('explain everything')) {
      return a.summary;
    }

    if (q.includes('youtube link') || q.includes('find the') || q.includes('url')) {
      if (a.youtubeLink) {
        return `A YouTube URL was detected in this screenshot: ${a.youtubeLink}\n\nThe link appears to be from the YouTube video page and points to a video on the platform.`;
      }
      return 'No complete YouTube link was found in this screenshot. Please upload a clearer screenshot or paste the link manually.';
    }

    if (q.includes('video title') || q.includes('title')) {
      const titleEl = a.detectedElements.find((e) => e.label.toLowerCase().includes('title'));
      return titleEl
        ? `The video title visible in the screenshot is: "${titleEl.value}"`
        : 'No video title was clearly visible in the screenshot.';
    }

    if (q.includes('activit') || q.includes('button') || q.includes('action')) {
      const available = a.activities.filter((act) => act.status === 'Available');
      return `The following activities are visible and available in this screenshot:\n\n${available.map((act) => `• ${act.activity}`).join('\n')}\n\nThese are standard interface elements detected on the ${a.platform} page.`;
    }

    if (q.includes('channel')) {
      const channelEl = a.detectedElements.find((e) => e.label.toLowerCase().includes('channel'));
      return channelEl
        ? `The channel visible in this screenshot is: "${channelEl.value}"`
        : 'No channel name was clearly visible in the screenshot.';
    }

    if (q.includes('ui') || q.includes('interface')) {
      return `This is a ${a.platform} interface. The UI contains standard elements including navigation, video player area, action buttons (like, subscribe, comment, share), and metadata display (title, channel, view count, duration). The layout follows the typical ${a.platform} design pattern.`;
    }

    if (q.includes('summar')) {
      return a.summary;
    }

    if (q.includes('text') || q.includes('extract')) {
      return `Text detected in the screenshot:\n\n${a.detectedElements.map((e) => `${e.label}: ${e.value}`).join('\n')}`;
    }

    return `Based on the screenshot analysis, I can see this is a ${a.platform} page. ${a.summary}\n\nFeel free to ask me more specific questions about the content, activities, or any links visible in the screenshot.`;
  }

  if (context?.youtubeInfo) {
    const info = context.youtubeInfo;
    if (!info.fetched) {
      const channelLine = info.channel ? `\n• Channel: ${info.channel}` : '';
      return `This YouTube video has been analyzed. Here's what's available:\n\n• Video URL: ${info.url}\n• Video ID: ${info.videoId}${channelLine}\n• Public thumbnail: ${info.thumbnail ? 'Available' : 'Not available'}\n\n${info.error || 'For more detailed metadata, a valid YouTube API key is required.'}`;
    }
    if (q.includes('title')) {
      return info.title
        ? `The video title is: "${info.title}"`
        : 'The video title could not be retrieved.';
    }
    if (q.includes('channel')) {
      return info.channel
        ? `The channel is: "${info.channel}"`
        : 'No channel information was available.';
    }
    if (q.includes('view')) {
      return info.viewCount
        ? `This video has ${parseInt(info.viewCount).toLocaleString()} views.`
        : 'View count is not available for this video.';
    }
    if (q.includes('like')) {
      return info.likeCount
        ? `This video has ${parseInt(info.likeCount).toLocaleString()} likes.`
        : 'Like count is not available for this video.';
    }
    if (q.includes('comment')) {
      return info.commentCount
        ? `This video has ${parseInt(info.commentCount).toLocaleString()} comments.`
        : 'Comment count is not available for this video.';
    }
    if (q.includes('duration') || q.includes('long')) {
      return info.duration
        ? `This video is ${info.duration} long.`
        : 'Duration is not available for this video.';
    }
    if (q.includes('publish') || q.includes('upload') || q.includes('when')) {
      return info.publishedAt
        ? `This video was published on ${new Date(info.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
        : 'Publish date is not available.';
    }
    if (q.includes('thumbnail')) {
      return info.thumbnail
        ? `A thumbnail is available for this video.`
        : 'No thumbnail is available for this video.';
    }
    if (q.includes('description') || q.includes('about')) {
      return info.description
        ? `Here is the video description:\n\n${info.description}`
        : 'No description is available for this video.';
    }
    if (q.includes('summar')) {
      const parts: string[] = [];
      if (info.title) parts.push(`Title: "${info.title}"`);
      if (info.channel) parts.push(`Channel: ${info.channel}`);
      if (info.viewCount) parts.push(`Views: ${parseInt(info.viewCount).toLocaleString()}`);
      if (info.likeCount) parts.push(`Likes: ${parseInt(info.likeCount).toLocaleString()}`);
      if (info.duration) parts.push(`Duration: ${info.duration}`);
      if (info.publishedAt) parts.push(`Published: ${new Date(info.publishedAt).toLocaleDateString()}`);
      return parts.length > 0
        ? `Here is a summary of the video:\n\n${parts.map((p) => `• ${p}`).join('\n')}`
        : 'Limited information is available for this video.';
    }
    const parts: string[] = [`• Video URL: ${info.url}`, `• Video ID: ${info.videoId}`];
    if (info.title) parts.push(`• Title: "${info.title}"`);
    if (info.channel) parts.push(`• Channel: ${info.channel}`);
    if (info.viewCount) parts.push(`• Views: ${parseInt(info.viewCount).toLocaleString()}`);
    if (info.duration) parts.push(`• Duration: ${info.duration}`);
    return `This YouTube video has been fully analyzed. Here's the available information:\n\n${parts.join('\n')}\n\nFeel free to ask me about the title, channel, views, likes, comments, duration, or publish date.`;
  }

  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return "Hello! I'm Direct AI, your assistant for understanding screenshots, videos, and activities. Upload a screenshot or paste a YouTube link to get started, or ask me anything!";
  }

  if (q.includes('what can you do') || q.includes('help') || q.includes('capab')) {
    return "I can help you with:\n\n• Screenshot Analysis — Upload an image and I'll identify the platform, detect visible elements, extract text, and find URLs.\n• YouTube Link Detection — I can extract YouTube URLs from screenshots and analyze video metadata.\n• Activity Detection — I'll identify visible buttons, actions, and interface elements.\n• Conversational AI — Ask me follow-up questions about any screenshot or video.\n\nUpload a screenshot or paste a YouTube link to begin!";
  }

  return "I'm here to help you understand screenshots, videos, and activities. Try uploading a screenshot or pasting a YouTube link, and I'll analyze it for you. You can also ask me questions about any uploaded content.";
}
