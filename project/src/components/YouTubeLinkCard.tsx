import { useState } from 'react';
import { Youtube, ExternalLink, Copy, Check, Link2, Eye, ThumbsUp, MessageCircle, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { YouTubeVideoInfo } from '@/types';

interface Props {
  info?: YouTubeVideoInfo;
  url?: string;
}

export default function YouTubeLinkCard({ info, url }: Props) {
  const [copied, setCopied] = useState(false);
  const link = info?.url || url || null;

  if (!link) {
    return (
      <div className="mt-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Link2 className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">No YouTube URL Detected</span>
        </div>
        <p className="text-xs text-amber-300/70">
          No complete YouTube link was found in this screenshot. Please upload a clearer screenshot or paste the link manually.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 overflow-hidden">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <Youtube className="w-4 h-4 text-red-400" />
        <h4 className="text-sm font-semibold text-white">YouTube Link Detected</h4>
      </div>

      <div className="px-4 pb-2">
        <code className="block text-xs text-gray-300 bg-black/30 rounded-lg px-3 py-2 font-mono break-all">
          {link}
        </code>
      </div>

      {info?.error && (
        <div className="mx-4 mb-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-amber-300/80">{info.error}</span>
        </div>
      )}

      {info?.thumbnail && (
        <div className="px-4 pb-3">
          <img
            src={info.thumbnail}
            alt="YouTube thumbnail"
            className="w-full max-w-xs rounded-lg border border-white/10"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {info?.title && (
        <div className="px-4 pb-2">
          <h5 className="text-sm font-semibold text-white leading-snug">{info.title}</h5>
        </div>
      )}

      {info && (
        <div className="px-4 pb-3 space-y-1.5">
          {info.channel && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Channel</span>
              <span className="text-gray-200 font-medium">{info.channel}</span>
            </div>
          )}
          {info.videoId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Video ID</span>
              <span className="text-gray-300 font-mono">{info.videoId}</span>
            </div>
          )}
          {info.viewCount && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1"><Eye className="w-3 h-3" /> Views</span>
              <span className="text-gray-200">{parseInt(info.viewCount).toLocaleString()}</span>
            </div>
          )}
          {info.likeCount && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> Likes</span>
              <span className="text-gray-200">{parseInt(info.likeCount).toLocaleString()}</span>
            </div>
          )}
          {info.commentCount && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Comments</span>
              <span className="text-gray-200">{parseInt(info.commentCount).toLocaleString()}</span>
            </div>
          )}
          {info.duration && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</span>
              <span className="text-gray-200">{info.duration}</span>
            </div>
          )}
          {info.publishedAt && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Published</span>
              <span className="text-gray-200">{new Date(info.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {info.description && (
            <div className="pt-1.5">
              <span className="text-gray-500 text-xs">Description</span>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-3">{info.description}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 px-4 pb-3">
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open YouTube
        </a>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
