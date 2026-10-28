import { Home, MessageSquare, Image, Youtube, History, Settings, Sparkles, X } from 'lucide-react';
import type { ViewName } from '@/types';

interface SidebarProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { id: ViewName; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'chat', label: 'New Chat', icon: MessageSquare },
  { id: 'screenshot', label: 'Screenshot Analyzer', icon: Image },
  { id: 'youtube', label: 'YouTube Analyzer', icon: Youtube },
  { id: 'history', label: 'Activity History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-72 z-40
          flex flex-col
          bg-ink-900/95 backdrop-blur-xl
          border-r border-white/5
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">DIRECT AI</h1>
              <p className="text-[11px] text-gray-500 leading-tight">AI Screenshot & Video Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${active
                    ? 'bg-gradient-to-r from-accent-500/20 to-indigo-500/10 text-white border border-accent-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? 'text-accent-400' : ''}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-indigo-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">Direct AI</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              AI Screenshot & Video Assistant
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
