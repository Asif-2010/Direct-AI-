import { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  onImageClick: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, onImageClick, disabled, placeholder }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-3 glass border-t border-white/5">
      <button
        onClick={onImageClick}
        className="flex-shrink-0 p-2.5 rounded-xl glass-card text-gray-400 hover:text-white hover:border-accent-500/30 transition-colors"
        title="Upload screenshot"
      >
        <ImagePlus className="w-5 h-5" />
      </button>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={placeholder || 'Ask Direct AI about your screenshot or video...'}
        className="flex-1 bg-ink-850/70 text-sm text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 resize-none outline-none border border-white/5 focus:border-accent-500/30 transition-colors max-h-[120px]"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-accent-500 to-indigo-500 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
}
