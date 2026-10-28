import { useState } from 'react';
import { History, Trash2, X, Image, Youtube, MessageSquare, ChevronRight, AlertCircle } from 'lucide-react';
import type { ActivityHistoryItem, ViewName } from '@/types';
import ChatHeader from '@/components/ChatHeader';
import { getRelativeDay } from '@/utils/analysis';

interface Props {
  history: ActivityHistoryItem[];
  onClearAll: () => void;
  onDeleteItem: (id: string) => void;
  onNavigate: (view: ViewName) => void;
  onMenuClick: () => void;
}

export default function HistoryView({ history, onClearAll, onDeleteItem, onNavigate, onMenuClick }: Props) {
  const [confirmClear, setConfirmClear] = useState(false);

  const grouped = history.reduce<Record<string, ActivityHistoryItem[]>>((acc, item) => {
    const day = getRelativeDay(item.timestamp);
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  const iconFor = (type: string) => {
    if (type === 'screenshot') return Image;
    if (type === 'youtube') return Youtube;
    return MessageSquare;
  };

  const colorFor = (type: string) => {
    if (type === 'screenshot') return 'text-accent-400 bg-accent-500/10';
    if (type === 'youtube') return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-white/5';
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader onMenuClick={onMenuClick} onNewChat={() => onNavigate('chat')} onNavigate={onNavigate} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-indigo-500/10 flex items-center justify-center">
                <History className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Activity History</h2>
                <p className="text-xs text-gray-500">{history.length} saved {history.length === 1 ? 'activity' : 'activities'}</p>
              </div>
            </div>

            {history.length > 0 && !confirmClear && (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}

            {confirmClear && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 hidden sm:inline">Are you sure?</span>
                <button
                  onClick={() => { onClearAll(); setConfirmClear(false); }}
                  className="px-3 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium hover:opacity-90"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-3 py-2 rounded-xl glass-card text-gray-300 text-sm font-medium hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center pt-16 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <History className="w-8 h-8 text-gray-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">No activity history yet</p>
                <p className="text-xs text-gray-600">Your analysis sessions will appear here.</p>
              </div>
              <button
                onClick={() => onNavigate('chat')}
                className="mt-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent-500 to-indigo-500 text-white text-sm font-medium hover:opacity-90"
              >
                Start New Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([day, items]) => (
                <div key={day}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">{day}</h3>
                  <div className="space-y-2">
                    {items.map((item) => {
                      const Icon = iconFor(item.type);
                      return (
                        <div
                          key={item.id}
                          className="group glass-card rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${colorFor(item.type)}`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>

                            {item.thumbnail && (
                              <img
                                src={item.thumbnail}
                                alt="Thumbnail"
                                className="flex-shrink-0 w-14 h-14 rounded-lg object-cover border border-white/10"
                              />
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                                <span className="text-xs text-gray-500 flex-shrink-0">{item.time}</span>
                              </div>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{item.userQuestion}</p>
                              <p className="text-xs text-gray-600 truncate mt-0.5">{item.aiResponse}</p>

                              {item.youtubeLink && (
                                <div className="flex items-center gap-1 mt-1.5">
                                  <Youtube className="w-3 h-3 text-red-400 flex-shrink-0" />
                                  <span className="text-xs text-red-400 truncate font-mono">{item.youtubeLink}</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                              className="flex-shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
