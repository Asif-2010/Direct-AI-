import { useState, useEffect } from 'react';
import type { ViewName, ChatMessage, AppSettings, ActivityHistoryItem } from '@/types';
import Sidebar from '@/components/Sidebar';
import HomeDashboard from '@/views/HomeDashboard';
import ChatView from '@/views/ChatView';
import YouTubeAnalyzer from '@/views/YouTubeAnalyzer';
import HistoryView from '@/views/HistoryView';
import SettingsView from '@/views/SettingsView';
import { loadHistory, saveHistory, clearHistory, loadSettings, saveSettings } from '@/utils/storage';

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [youtubeMessages, setYoutubeMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<ActivityHistoryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const handleNavigate = (view: ViewName) => {
    setCurrentView(view);
  };

  const handleSaveHistory = (item: ActivityHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev];
      saveHistory(updated);
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveHistory(updated);
      return updated;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {currentView === 'home' && (
          <HomeDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'chat' && (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            onNavigate={handleNavigate}
            onMenuClick={() => setSidebarOpen(true)}
            settings={settings}
            onSaveHistory={handleSaveHistory}
          />
        )}

        {currentView === 'screenshot' && (
          <ChatView
            messages={messages}
            setMessages={setMessages}
            onNavigate={handleNavigate}
            onMenuClick={() => setSidebarOpen(true)}
            settings={settings}
            onSaveHistory={handleSaveHistory}
            showUploadFirst
          />
        )}

        {currentView === 'youtube' && (
          <YouTubeAnalyzer
            messages={youtubeMessages}
            setMessages={setYoutubeMessages}
            onNavigate={handleNavigate}
            onMenuClick={() => setSidebarOpen(true)}
            settings={settings}
            onSaveHistory={handleSaveHistory}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            history={history}
            onClearAll={handleClearAllHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onNavigate={handleNavigate}
            onMenuClick={() => setSidebarOpen(true)}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
            onNavigate={handleNavigate}
            onMenuClick={() => setSidebarOpen(true)}
            onClearHistory={handleClearAllHistory}
          />
        )}
      </main>
    </div>
  );
}

export default App;
