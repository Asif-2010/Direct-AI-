import { Image, Youtube, Activity, ArrowRight, Sparkles } from 'lucide-react';
import type { ViewName } from '@/types';

interface Props {
  onNavigate: (view: ViewName) => void;
}

const features = [
  {
    icon: Image,
    title: 'Screenshot Analysis',
    desc: 'Upload a screenshot and let AI understand the visible content.',
    color: 'from-accent-500/20 to-accent-500/5',
    iconColor: 'text-accent-400',
  },
  {
    icon: Youtube,
    title: 'YouTube Analysis',
    desc: 'Paste a YouTube URL or analyze information visible in a screenshot.',
    color: 'from-red-500/20 to-red-500/5',
    iconColor: 'text-red-400',
  },
  {
    icon: Activity,
    title: 'Activity Detection',
    desc: 'Identify visible buttons, actions, links and interface elements.',
    color: 'from-emerald-500/20 to-emerald-500/5',
    iconColor: 'text-emerald-400',
  },
];

export default function HomeDashboard({ onNavigate }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span className="text-xs font-medium text-gray-300">Direct AI — Your AI assistant for understanding screenshots, videos and activities.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            What can <span className="gradient-text">Direct AI</span> help you understand?
          </h1>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            Upload a screenshot, paste a YouTube link, or ask a question. Direct AI will analyze visible content, detect activities, and extract useful information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer group animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => onNavigate(i === 0 ? 'screenshot' : i === 1 ? 'youtube' : 'chat')}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigate('chat')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-accent-500 to-indigo-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-accent-500/20"
          >
            Start New Analysis
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
