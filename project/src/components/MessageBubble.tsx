import { useState } from 'react';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Sparkles, User } from 'lucide-react';
import type { ChatMessage } from '@/types';
import ScreenshotAnalysisCard from './ScreenshotAnalysisCard';
import YouTubeLinkCard from './YouTubeLinkCard';

interface MessageBubbleProps {
  message: ChatMessage;
  onRegenerate: () => void;
  onLike: () => void;
  onDislike: () => void;
}

export default function MessageBubble({ message, onRegenerate, onLike, onDislike }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 sm:gap-4 animate-fade-in-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`
        flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
        ${isUser
          ? 'bg-gradient-to-br from-gray-600 to-gray-700'
          : 'bg-gradient-to-br from-accent-500 to-indigo-500'
        }
      `}>
        {isUser ? <User className="w-4.5 h-4.5 text-white" /> : <Sparkles className="w-4.5 h-4.5 text-white" />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          rounded-2xl px-4 py-3
          ${isUser
            ? 'bg-gradient-to-br from-accent-500/15 to-indigo-500/10 border border-accent-500/20 rounded-tr-md'
            : 'glass-card rounded-tl-md'
          }
        `}>
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded screenshot"
              className="max-w-full rounded-lg mb-3 max-h-64 object-contain"
            />
          )}
          {message.content && (
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}

          {message.analysis && <ScreenshotAnalysisCard analysis={message.analysis} />}

          {message.youtubeInfo && <YouTubeLinkCard info={message.youtubeInfo} />}
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[11px] text-gray-500">{message.timestamp}</span>

          {!isUser && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
                title="Regenerate response"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onLike}
                className={`p-1.5 rounded-lg transition-colors ${
                  message.liked ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onDislike}
                className={`p-1.5 rounded-lg transition-colors ${
                  message.disliked ? 'text-rose-400 bg-rose-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
                title="Bad response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
