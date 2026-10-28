import { ScanText, FileText, Youtube, ListChecks, Layout, FileSearch } from 'lucide-react';

interface Props {
  onPromptClick: (prompt: string) => void;
}

const prompts = [
  { label: 'Analyze Screenshot', prompt: 'Analyze this screenshot and tell me what you see.', icon: ScanText },
  { label: 'Extract Text', prompt: 'Extract all visible text from this screenshot.', icon: FileText },
  { label: 'Find YouTube Link', prompt: 'Find the YouTube link in this screenshot.', icon: Youtube },
  { label: 'Detect Activities', prompt: 'What activities can you identify in this screenshot?', icon: ListChecks },
  { label: 'Explain UI', prompt: 'Explain the UI elements visible in this screenshot.', icon: Layout },
  { label: 'Summarize', prompt: 'Summarize everything in this screenshot.', icon: FileSearch },
];

export default function SuggestedPrompts({ onPromptClick }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => {
        const Icon = p.icon;
        return (
          <button
            key={p.label}
            onClick={() => onPromptClick(p.prompt)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-card text-sm text-gray-300 hover:text-white hover:border-accent-500/30 transition-all duration-200 hover:scale-[1.02]"
          >
            <Icon className="w-4 h-4 text-accent-400" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
