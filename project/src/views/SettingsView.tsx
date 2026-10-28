import { Settings, Zap, Save, Trash, Image, Shield } from 'lucide-react';
import type { AppSettings, ViewName } from '@/types';
import ChatHeader from '@/components/ChatHeader';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onNavigate: (view: ViewName) => void;
  onMenuClick: () => void;
  onClearHistory: () => void;
}

export default function SettingsView({ settings, setSettings, onNavigate, onMenuClick, onClearHistory }: Props) {
  return (
    <div className="flex-1 flex flex-col h-screen">
      <ChatHeader onMenuClick={onMenuClick} onNewChat={() => onNavigate('chat')} onNavigate={onNavigate} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-indigo-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Settings</h2>
              <p className="text-xs text-gray-500">Configure Direct AI behavior</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-white">AI Behavior</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-gray-200">Auto-analyze screenshots</p>
                    <p className="text-xs text-gray-500">Automatically run analysis when an image is uploaded</p>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, autoAnalyze: !s.autoAnalyze }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${settings.autoAnalyze ? 'bg-accent-500' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.autoAnalyze ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-gray-200">Save activity history</p>
                    <p className="text-xs text-gray-500">Store analysis sessions in browser storage</p>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, saveHistory: !s.saveHistory }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${settings.saveHistory ? 'bg-accent-500' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.saveHistory ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </label>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-4 h-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-white">Upload Limits</h3>
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-2">Maximum image size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.maxImageSizeMB}
                  onChange={(e) => setSettings((s) => ({ ...s, maxImageSizeMB: Math.max(1, Number(e.target.value)) }))}
                  className="w-24 bg-ink-850/70 text-sm text-gray-200 rounded-xl px-3 py-2 outline-none border border-white/5 focus:border-accent-500/30 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1.5">Images larger than this will be rejected.</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-white">Data & Privacy</h3>
              </div>

              <button
                onClick={onClearHistory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors"
              >
                <Trash className="w-4 h-4" />
                Clear all activity history
              </button>
              <p className="text-xs text-gray-500 mt-2">This will permanently delete all saved analysis sessions from your browser.</p>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Save className="w-4 h-4 text-accent-400" />
                <h3 className="text-sm font-semibold text-white">About Direct AI</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Direct AI is your AI assistant for understanding screenshots, videos and activities. It analyzes visible content, detects YouTube links, identifies interface activities, and provides conversational AI support. All data is stored locally in your browser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
