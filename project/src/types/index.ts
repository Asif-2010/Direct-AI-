export type ViewName = 'home' | 'chat' | 'screenshot' | 'youtube' | 'history' | 'settings';

export type MessageRole = 'user' | 'ai';

export type MessageType = 'text' | 'image' | 'analysis' | 'youtube' | 'error';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: string;
  imageUrl?: string;
  analysis?: ScreenshotAnalysis;
  youtubeInfo?: YouTubeVideoInfo;
  liked?: boolean;
  disliked?: boolean;
}

export interface ScreenshotAnalysis {
  platform: string;
  detectedElements: DetectedElement[];
  youtubeLink?: string | null;
  youtubeInfo?: YouTubeVideoInfo;
  activities: ActivityItem[];
  summary: string;
  fullText?: string;
  brief?: ScreenshotBrief;
}

export interface ScreenshotBrief {
  contentType: string;
  keyInsights: string[];
  detectedEntities: DetectedEntity[];
  detectedKeywords: string[];
  textConfidence: 'High' | 'Medium' | 'Low';
  fullTextPreview: string;
}

export interface DetectedEntity {
  type: 'Channel' | 'URL' | 'Number' | 'Title' | 'Date' | 'Handle';
  value: string;
}

export interface DetectedElement {
  label: string;
  value: string;
}

export interface ActivityItem {
  activity: string;
  status: 'Available' | 'Not Visible' | 'Detected';
}

export interface YouTubeVideoInfo {
  url: string;
  videoId: string;
  title: string | null;
  channel: string | null;
  thumbnail: string | null;
  availableMetadata: string[];
  description?: string | null;
  publishedAt?: string | null;
  viewCount?: string | null;
  likeCount?: string | null;
  commentCount?: string | null;
  duration?: string | null;
  fetched: boolean;
  error?: string | null;
}

export interface ActivityHistoryItem {
  id: string;
  type: 'screenshot' | 'youtube' | 'text';
  title: string;
  date: string;
  time: string;
  timestamp: number;
  thumbnail?: string;
  userQuestion: string;
  aiResponse: string;
  youtubeLink?: string | null;
  analysis?: ScreenshotAnalysis;
}

export interface AppSettings {
  autoAnalyze: boolean;
  saveHistory: boolean;
  maxImageSizeMB: number;
  theme: 'dark';
}
