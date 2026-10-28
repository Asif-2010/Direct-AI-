import { useState } from 'react';
import { Monitor, Link2, ListChecks, FileText, Lightbulb, Tag, Hash, ChevronDown, ChevronUp, Type, Layers } from 'lucide-react';
import type { ScreenshotAnalysis } from '@/types';
import ActivityTable from './ActivityTable';
import YouTubeLinkCard from './YouTubeLinkCard';

interface Props {
  analysis: ScreenshotAnalysis;
}

export default function ScreenshotAnalysisCard({ analysis }: Props) {
  const [showFullText, setShowFullText] = useState(false);
  const brief = analysis.brief;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Monitor className="w-4 h-4 text-accent-400" />
        <h4 className="text-sm font-semibold text-white">Screenshot Analysis</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {analysis.detectedElements.map((el, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
            <span className="text-xs text-gray-500">{el.label}</span>
            <span className="text-xs font-medium text-gray-200 truncate ml-2 max-w-[60%]">{el.value}</span>
          </div>
        ))}
      </div>

      {brief && (
        <div className="rounded-xl bg-gradient-to-br from-accent-500/8 to-indigo-500/5 border border-accent-500/15 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-400" />
            <h5 className="text-sm font-semibold text-white">Detailed Brief</h5>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Content Type</span>
            <span className="text-accent-300 font-medium">{brief.contentType}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Text Confidence</span>
            <span className={`font-medium ${brief.textConfidence === 'High' ? 'text-emerald-400' : brief.textConfidence === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>
              {brief.textConfidence}
            </span>
          </div>

          {brief.detectedKeywords.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">Content Categories</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {brief.detectedKeywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 rounded-md bg-accent-500/15 text-accent-300 text-xs font-medium border border-accent-500/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Key Insights</span>
            </div>
            <ul className="space-y-1">
              {brief.keyInsights.map((insight, i) => (
                <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                  <span className="text-accent-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {brief.detectedEntities.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs text-gray-500">Detected Entities</span>
              </div>
              <div className="space-y-1">
                {brief.detectedEntities.map((entity, i) => (
                  <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-white/5">
                    <span className="text-gray-500">{entity.type}</span>
                    <span className="text-gray-200 font-mono truncate ml-2 max-w-[65%]">{entity.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analysis.youtubeLink && <YouTubeLinkCard url={analysis.youtubeLink} info={analysis.youtubeInfo} />}

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <ListChecks className="w-4 h-4 text-accent-400" />
        <h4 className="text-sm font-semibold text-white">Detected Activities</h4>
      </div>
      <ActivityTable activities={analysis.activities} />

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Type className="w-4 h-4 text-accent-400" />
        <h4 className="text-sm font-semibold text-white">Extracted Text</h4>
      </div>
      <div className="rounded-xl bg-black/30 border border-white/5 p-3">
        <p className={`text-xs text-gray-400 leading-relaxed font-mono whitespace-pre-wrap ${!showFullText ? 'line-clamp-4' : ''}`}>
          {analysis.fullText || (brief?.fullTextPreview ?? 'No text could be extracted')}
        </p>
        {(analysis.fullText && analysis.fullText.length > 200) && (
          <button
            onClick={() => setShowFullText((v) => !v)}
            className="flex items-center gap-1 mt-2 text-xs text-accent-400 hover:text-accent-300 transition-colors"
          >
            {showFullText ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all text</>}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <FileText className="w-4 h-4 text-accent-400" />
        <h4 className="text-sm font-semibold text-white">Summary</h4>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{analysis.summary}</p>
    </div>
  );
}
