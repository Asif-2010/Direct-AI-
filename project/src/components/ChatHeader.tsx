import { Menu, Plus, History, Settings, Circle } from 'lucide-react';
import type { ViewName } from '@/types';

interface ChatHeaderProps {
  onMenuClick: () => void;
  onNewChat: () => void;
  onNavigate: (view: ViewName) => void;
}

export default function ChatHeader({ onMenuClick, onNewChat, onNavigate }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 glass border-b border-white/5">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white p-1.5 -ml-1.5"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-white">Direct AI</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">AI Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-indigo-500 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-accent-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
          <button
            onClick={() => onNavigate('history')}
            className="p-2 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
            title="History"
          >
            <History className="w-[18px] h-[18px]" />
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 rounded-xl glass-card text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
