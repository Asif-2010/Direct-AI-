import { useState, useRef, useEffect } from 'react';
import { Sparkles, ScanText } from 'lucide-react';
import type { ChatMessage, ScreenshotAnalysis, AppSettings, ActivityHistoryItem } from '@/types';
import ChatHeader from '@/components/ChatHeader';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import ScreenshotUpload from '@/components/ScreenshotUpload';
import SuggestedPrompts from '@/components/SuggestedPrompts';
import { generateId, formatTime, analyzeScreenshot, generateAIResponse, fileToDataUrl } from '@/utils/analysis';
import type { ViewName } from '@/types';

interface Props {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onNavigate: (view: ViewName) => void;
  onMenuClick: () => void;
  settings: AppSettings;
  onSaveHistory: (item: ActivityHistoryItem) => void;
  showUploadFirst?: boolean;
}

export default function ChatView({ messages, setMessages, onNavigate, onMenuClick, settings, onSaveHistory, showUploadFirst }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState('');
  const [lastAnalysis, setLastAnalysis] = useState<ScreenshotAnalysis | null>(null);
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
      const aiResponse = generateAIResponse(text, { analysis: lastAnalysis || undefined, youtubeInfo: lastAnalysis?.youtubeInfo });
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        type: 'text',
        content: aiResponse,
        timestamp: formatTime(new Date()),
      };
      addMessage(aiMsg);

      if (settings.saveHistory) {
        onSaveHistory({
          id: generateId(),
          type: 'text',
          title: text.slice(0, 50),
          date: new Date().toLocaleDateString(),
          time: formatTime(new Date()),
          timestamp: Date.now(),
          userQuestion: text,
          aiResponse: aiResponse,
        });
      }
    }, 600);
  };

  const handleUpload = async (dataUrl: string, _file: File) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      type: 'image',
      content: 'What is shown in this screenshot?',
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
            title: 'Screenshot Analysis',
            date: new Date().toLocaleDateString(),
            time: formatTime(new Date()),
            timestamp: Date.now(),
            thumbnail: dataUrl,
            userQuestion: 'What is shown in this screenshot?',
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

  const handleNewChat = () => {
    setMessages([]);
    setLastAnalysis(null);
  };

  const handleRegenerate = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id && m.role === 'ai') {
          const newResponse = generateAIResponse('Regenerate', { analysis: lastAnalysis || undefined, youtubeInfo: lastAnalysis?.youtubeInfo });
          return { ...m, content: newResponse, timestamp: formatTime(new Date()) };
        }
        return m;
      })
    );
  };

  const handleLike = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, liked: !m.liked, disliked: false } : m)));
  };

  const handleDislike = (id: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, disliked: !m.disliked, liked: false } : m)));
  };

  const handlePromptClick = (prompt: string) => {
    handleSendText(prompt);
  };

  const isEmpty = messages.length === 0 && !isAnalyzing;

  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader onMenuClick={onMenuClick} onNewChat={handleNewChat} onNavigate={onNavigate} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {isEmpty ? (
            <div className="flex flex-col items-center pt-8 sm:pt-16 gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-white mb-2">How can I help you today?</h2>
                <p className="text-sm text-gray-500">Upload a screenshot or ask me anything to get started.</p>
              </div>

              <div className="w-full max-w-xl">
                <ScreenshotUpload onUpload={handleUpload} settings={settings} />
              </div>

              <div className="w-full max-w-xl">
                <p className="text-xs font-medium text-gray-500 mb-3 text-center">Or try one of these</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handleSendText('What can you do?')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-sm text-gray-300 hover:text-white hover:border-accent-500/30 transition-all"
                  >
                    <ScanText className="w-4 h-4 text-accent-400" />
                    What can Direct AI do?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onRegenerate={() => handleRegenerate(msg.id)}
                  onLike={() => handleLike(msg.id)}
                  onDislike={() => handleDislike(msg.id)}
                />
              ))}

              {isAnalyzing && (
                <div className="flex gap-4 animate-fade-in">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-indigo-500 flex items-center justify-center">
                    <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                  </div>
                  <div className="glass-card rounded-2xl rounded-tl-md px-4 py-3 flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm text-gray-400">{analyzeStatus || 'Analyzing screenshot...'} {analyzeProgress > 0 && `${analyzeProgress}%`}</span>
                    </div>
                    {analyzeProgress > 0 && (
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-accent-500 to-indigo-500 transition-all duration-300" style={{ width: `${analyzeProgress}%` }} />
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
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              fileToDataUrl(file).then((url) => handleUpload(url, file));
            }
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
