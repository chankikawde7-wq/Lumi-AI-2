import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface UploadAreaProps {
  onUpload: (file: File) => void;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
  examples?: { url: string; label: string }[];
}

export default function UploadArea({ 
  onUpload, 
  maxSizeMB = 25, 
  accept = "image/jpeg, image/png, image/webp",
  className,
  examples
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingExample, setLoadingExample] = useState<number | null>(null);
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

  const handleExampleClick = async (url: string, index: number) => {
    try {
      setLoadingExample(index);
      setError(null);
      
      let response;
      if (url.startsWith('/')) {
        response = await fetch(url);
      } else {
        response = await fetch("/api/proxy-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });
      }

      if (!response.ok) throw new Error("Failed to load example image");
      
      const blob = await response.blob();
      const filename = url.split('/').pop() || `example-${index}.jpg`;
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
      
      onUpload(file);
    } catch (err) {
      console.error(err);
      setError("Could not load the example image. Please try uploading your own.");
    } finally {
      setLoadingExample(null);
    }
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
      
      {examples && examples.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">No image? Try one of these:</p>
          <div className="flex flex-wrap gap-4">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExampleClick(example.url, index);
                }}
                disabled={loadingExample !== null}
                className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-transform hover:scale-105"
              >
                <img 
                  src={example.url} 
                  alt={example.label} 
                  className={cn(
                    "w-full h-full object-cover transition-opacity", 
                    loadingExample === index ? "opacity-50" : "opacity-100 group-hover:opacity-90"
                  )} 
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-medium px-2 text-center drop-shadow-md">
                    {example.label}
                  </span>
                </div>
                {loadingExample === index && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Loader2 className="w-6 h-6 text-white animate-spin drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
