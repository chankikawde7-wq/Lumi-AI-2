import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface UploadAreaProps {
  onUpload: (file: File) => void;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

export default function UploadArea({ 
  onUpload, 
  maxSizeMB = 25, 
  accept = "image/jpeg, image/png, image/webp",
  className
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }
    
    // Check type (simple check)
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }

    onUpload(file);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "relative w-full h-80 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer group",
          isDragging 
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10" 
            : "border-slate-300 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-600 bg-slate-50 dark:bg-slate-900/50"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInput}
          accept={accept}
          className="hidden" 
        />
        
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
          isDragging ? "bg-primary-100 text-primary-600" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/50 dark:group-hover:text-primary-400"
        )}>
          <UploadCloud className="w-8 h-8" />
        </div>
        
        <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
          Drag & drop an image here
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          or click to browse from your device
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-full shadow-sm">
            <ImageIcon className="w-3.5 h-3.5" />
            JPG, PNG, WEBP
          </span>
          <span className="flex items-center gap-1.5 bg-white dark:bg-slate-950 px-3 py-1.5 rounded-full shadow-sm">
            Max {maxSizeMB}MB
          </span>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
