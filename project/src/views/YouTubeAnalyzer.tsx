import { useState, useRef, useEffect } from 'react';
import { Youtube, Search, AlertCircle, Video, Sparkles } from 'lucide-react';
import type { YouTubeVideoInfo, ChatMessage, AppSettings, ActivityHistoryItem, ScreenshotAnalysis } from '@/types';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageBubble from '@/components/MessageBubble';
import ScreenshotUpload from '@/components/ScreenshotUpload';
import SuggestedPrompts from '@/components/SuggestedPrompts';
import { isValidYouTubeUrl, fetchYouTubeVideoData, generateId, formatTime, generateAIResponse, analyzeScreenshot, fileToDataUrl } from '@/utils/analysis';
import type { ViewName } from '@/types';

interface Props {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onNavigate: (view: ViewName) => void;
  onMenuClick: () => void;
  settings: AppSettings;
  onSaveHistory: (item: ActivityHistoryItem) => void;
}

export default function YouTubeAnalyzer({ messages, setMessages, onNavigate, onMenuClick, settings, onSaveHistory }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<YouTubeVideoInfo | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<ScreenshotAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const [isFetchingVideo, setIsFetchingVideo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isAnalyzing]);

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a YouTube URL.');
      return;
    }
    if (!isValidYouTubeUrl(trimmed)) {
      setError('Please enter a valid YouTube URL.');
      return;
    }
    setError(null);
    setIsFetchingVideo(true);

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      type: 'youtube',
      content: `Analyze this YouTube video: ${trimmed}`,
      timestamp: formatTime(new Date()),
    };
    addMessage(userMsg);

    try {
      const videoInfo = await fetchYouTubeVideoData(trimmed);
      setInfo(videoInfo);

      const aiContent = videoInfo.fetched
        ? 'I fetched the video details from the YouTube Data API. Here is the full information:'
        : videoInfo.error
          ? `I could not fetch full video details: ${videoInfo.error}`
          : 'I analyzed the YouTube URL. Here is the available information:';

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        type: 'youtube',
        content: aiContent,
        youtubeInfo: videoInfo,
        timestamp: formatTime(new Date()),
      };
      addMessage(aiMsg);

      if (settings.saveHistory) {
        onSaveHistory({
          id: generateId(),
          type: 'youtube',
          title: videoInfo.title || 'YouTube Video Analysis',
          date: new Date().toLocaleDateString(),
          time: formatTime(new Date()),
          timestamp: Date.now(),
          userQuestion: `Analyze: ${trimmed}`,
          aiResponse: videoInfo.title
            ? `${videoInfo.title} by ${videoInfo.channel || 'Unknown'} — ${videoInfo.viewCount ? parseInt(videoInfo.viewCount).toLocaleString() + ' views' : 'views N/A'}`
            : `Analyzed YouTube video with ID: ${videoInfo.videoId}`,
          youtubeLink: trimmed,
        });
      }
    } catch {
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        type: 'error',
        content: 'Something went wrong while fetching the YouTube video data. Please try again.',
        timestamp: formatTime(new Date()),
      };
      addMessage(aiMsg);
    } finally {
      setIsFetchingVideo(false);
    }
  };

  const handleUpload = async (dataUrl: string, _file: File) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      type: 'image',
      content: 'What YouTube information is in this screenshot?',
      imageUrl: dataUrl,
      timestamp: formatTime(new Date()),
    };
    addMessage(userMsg);

    if (settings.autoAnalyze) {
      setIsAnalyzing(true);
      setAnalyzeProgress(0);
      setAnalyzeStatus('Starting analysis...');
      try {
        const analysis = await analyzeScreenshot(dataUrl, (progress, status) => {
          setAnalyzeProgress(progress);
          setAnalyzeStatus(status);
        });
        setLastAnalysis(analysis);

        if (analysis.youtubeLink) {
          const videoInfo = analysis.youtubeInfo || await fetchYouTubeVideoData(analysis.youtubeLink);
          setInfo(videoInfo);
        }

        const aiMsg: ChatMessage = {
          id: generateId(),
          role: 'ai',
          type: 'analysis',
          content: 'Here is my analysis of your screenshot:',
          analysis,
          youtubeInfo: analysis.youtubeInfo,
          timestamp: formatTime(new Date()),
        };
        addMessage(aiMsg);

        if (settings.saveHistory) {
          onSaveHistory({
            id: generateId(),
            type: 'screenshot',
            title: 'YouTube Screenshot Analysis',
            date: new Date().toLocaleDateString(),
            time: formatTime(new Date()),
            timestamp: Date.now(),
            thumbnail: dataUrl,
            userQuestion: 'What YouTube information is in this screenshot?',
            aiResponse: analysis.summary,
            youtubeLink: analysis.youtubeLink,
            analysis,
          });
        }
      } catch {
        const aiMsg: ChatMessage = {
          id: generateId(),
          role: 'ai',
          type: 'error',
          content: 'Direct AI could not analyze the image. The OCR engine may have failed to load. Please try again with a clearer screenshot.',
          timestamp: formatTime(new Date()),
        };
        addMessage(aiMsg);
      } finally {
        setIsAnalyzing(false);
        setAnalyzeProgress(0);
        setAnalyzeStatus('');
      }
    }
  };

  const handleSendText = (text: string) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      type: 'text',
      content: text,
      timestamp: formatTime(new Date()),
    };
    addMessage(userMsg);

    setTimeout(() => {
      const aiResponse = generateAIResponse(text, {
        analysis: lastAnalysis || undefined,
        youtubeInfo: info || undefined,
      });
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        type: 'text',
        content: aiResponse,
        timestamp: formatTime(new Date()),
      };
      addMessage(aiMsg);
    }, 600);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendText(prompt);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInfo(null);
    setLastAnalysis(null);
  };

  const isEmpty = messages.length === 0 && !isAnalyzing && !isFetchingVideo && !info;

  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader onMenuClick={onMenuClick} onNewChat={handleNewChat} onNavigate={onNavigate} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="glass-card rounded-2xl p-6 mb-6 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
                <Youtube className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Paste YouTube Link</h2>
                <p className="text-xs text-gray-500">Enter a YouTube URL to analyze available video metadata.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Paste YouTube URL here..."
                className="flex-1 bg-ink-850/70 text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 outline-none border border-white/5 focus:border-red-500/30 transition-colors"
              />
              <button
                onClick={handleAnalyze}
                disabled={isFetchingVideo}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingVideo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Analyze Video
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          {isEmpty ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center pt-4 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
                  <Video className="w-7 h-7 text-red-400" />
                </div>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Paste a YouTube URL above or upload a screenshot to detect YouTube links and activities.
                </p>
              </div>

              <div className="max-w-xl mx-auto">
                <ScreenshotUpload onUpload={handleUpload} settings={settings} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={() => {}}
                  onLike={() => setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, liked: !m.liked, disliked: false } : m))}
                  onDislike={() => setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, disliked: !m.disliked, liked: false } : m))}
                />
              ))}

              {isAnalyzing && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3 flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-gray-400">{analyzeStatus || 'Analyzing screenshot...'} {analyzeProgress > 0 && `${analyzeProgress}%`}</span>
                    </div>
                    {analyzeProgress > 0 && (
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{ width: `${analyzeProgress}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {lastAnalysis && !isAnalyzing && messages.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-gray-500 mb-2.5">What would you like to know?</p>
                  <SuggestedPrompts onPromptClick={handlePromptClick} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={handleSendText}
          onImageClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          placeholder="Ask about this YouTube video or screenshot..."
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              fileToDataUrl(file).then((dataUrl) => handleUpload(dataUrl, file));
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
