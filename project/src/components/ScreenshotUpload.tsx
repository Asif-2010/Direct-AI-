import { useState, useRef, useCallback } from 'react';
import { UploadCloud, ImageIcon } from 'lucide-react';
import type { AppSettings } from '@/types';
import { validateImageFile, fileToDataUrl } from '@/utils/analysis';

interface ScreenshotUploadProps {
  onUpload: (dataUrl: string, file: File) => void;
  settings: AppSettings;
}

export default function ScreenshotUpload({ onUpload, settings }: ScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateImageFile(file, settings.maxImageSizeMB);
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file.');
        return;
      }
      setError(null);
      fileToDataUrl(file).then((dataUrl) => onUpload(dataUrl, file));
    },
    [onUpload, settings.maxImageSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-2xl p-8 sm:p-12
          border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-accent-500 bg-accent-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-accent-500/50 bg-ink-850/50 hover:bg-ink-800/50'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        <div className="flex flex-col items-center text-center gap-4">
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
            ${isDragging
              ? 'bg-accent-500/20 text-accent-400 scale-110'
              : 'bg-white/5 text-gray-400'
            }
          `}>
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Upload a Screenshot</h3>
            <p className="text-sm text-gray-500">Drop an image here or click to browse.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['PNG', 'JPG', 'JPEG', 'WEBP'].map((fmt) => (
              <span key={fmt} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-medium text-gray-400">
                <ImageIcon className="w-3 h-3" />
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  );
}
