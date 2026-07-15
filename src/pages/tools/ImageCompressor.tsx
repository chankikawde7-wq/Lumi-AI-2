import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Zap, AlertCircle, Image as ImageIcon, Settings2, HardDrive, Maximize, ArrowRight } from "lucide-react";
import UploadArea from "../../components/ui/UploadArea";
import CompareSlider from "../../components/ui/CompareSlider";
import { cn } from "../../lib/utils";

type CompressionLevel = "low" | "medium" | "high";

interface ImageStats {
  width: number;
  height: number;
  size: number;
}

export default function ImageCompressor() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalStats, setOriginalStats] = useState<ImageStats | null>(null);
  
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedStats, setCompressedStats] = useState<ImageStats | null>(null);
  
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>("medium");

  const handleUpload = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      setStatus("error");
      return;
    }

    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    
    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalStats({
        width: img.width,
        height: img.height,
        size: file.size
      });
      setStatus("idle");
    };
    img.onerror = () => {
      setErrorMsg("Failed to read image dimensions.");
      setStatus("error");
    };
    img.src = url;

    // Reset state
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedFile(null);
    setCompressedUrl(null);
    setCompressedStats(null);
    setErrorMsg("");
  };

  const compressImage = async (file: File, level: CompressionLevel): Promise<{ file: File, width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        
        // Determine settings based on compression level
        let quality = 0.7;
        let maxWidth = 4096;
        let maxHeight = 4096;
        
        if (level === "low") { // Low compression (High quality)
          quality = 0.9;
          maxWidth = 4096;
          maxHeight = 4096;
        } else if (level === "medium") { // Medium compression
          quality = 0.7;
          maxWidth = 2048;
          maxHeight = 2048;
        } else if (level === "high") { // High compression (Small size)
          quality = 0.5;
          maxWidth = 1280;
          maxHeight = 1280;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        width = Math.round(width);
        height = Math.round(height);

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize canvas"));
          return;
        }
        
        // Use a solid background for transparent images converted to JPEG, 
        // but we'll try to use WebP for PNGs to preserve transparency.
        if (file.type === "image/png" || file.type === "image/webp") {
          ctx.clearRect(0, 0, width, height);
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine output type. Convert PNG to WebP for better compression if possible, otherwise use original.
        let outputType = file.type;
        if (file.type === "image/png") {
           outputType = "image/webp"; // WebP compresses much better than PNG while keeping transparency
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to compress image"));
            return;
          }
          
          let extension = outputType.split('/')[1];
          if (extension === 'jpeg') extension = 'jpg';
          
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + `_compressed.${extension}`;
          
          const newFile = new File([blob], newFileName, {
            type: outputType,
            lastModified: Date.now(),
          });
          
          // If compressed is somehow larger and we didn't resize, just return original
          // (Usually happens on low compression with already compressed JPGs)
          if (newFile.size >= file.size && width === img.width && height === img.height) {
            resolve({ file, width: img.width, height: img.height });
          } else {
            resolve({ file: newFile, width, height });
          }
        }, outputType, quality);
      };
      
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = URL.createObjectURL(file);
    });
  };

  const startProcessing = async () => {
    if (!originalFile) return;
    setStatus("processing");
    setErrorMsg("");

    try {
      // Small timeout to allow UI to update
      await new Promise(r => setTimeout(r, 50));
      
      const result = await compressImage(originalFile, compressionLevel);
      
      const url = URL.createObjectURL(result.file);
      setCompressedFile(result.file);
      setCompressedUrl(url);
      setCompressedStats({
        width: result.width,
        height: result.height,
        size: result.file.size
      });
      
      setStatus("success");
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "An error occurred during compression.");
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!compressedFile || !compressedUrl) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = compressedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setOriginalFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setOriginalStats(null);
    
    setCompressedFile(null);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedUrl(null);
    setCompressedStats(null);
    
    setStatus("idle");
    setErrorMsg("");
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const calculateSavings = () => {
    if (!originalStats || !compressedStats) return { percent: 0, saved: 0 };
    const saved = originalStats.size - compressedStats.size;
    const percent = (saved / originalStats.size) * 100;
    return { 
      percent: Math.max(0, percent).toFixed(1), 
      saved: Math.max(0, saved) 
    };
  };

  const savings = calculateSavings();
  const isLarger = compressedStats && originalStats && compressedStats.size >= originalStats.size;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"><ArrowLeft className="w-4 h-4 mr-1"/> Back to tools</Link>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white"><Zap className="w-8 h-8 text-green-500" /> Image Compressor</h1>
            <p className="text-slate-500 mt-1">Reduce image file size without losing quality</p>
          </div>
          {status === "success" && (
            <div className="flex gap-3 mt-4 md:mt-0">
              <button onClick={reset} className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Upload New</button>
              <button onClick={handleDownload} className="px-4 py-2 bg-green-600 hover:bg-green-700 transition-colors text-sm font-medium text-white rounded-lg flex items-center shadow-sm"><Download className="w-4 h-4 mr-2"/> Download Compressed</button>
            </div>
          )}
        </div>
        
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold mb-4 uppercase text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-green-500"/>
                Compression Level
              </h3>
              
              <div className="space-y-3 mb-6">
                <label className={cn(
                  "flex items-start p-3 rounded-xl border cursor-pointer transition-colors",
                  compressionLevel === "low" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}>
                  <input type="radio" name="compression" value="low" checked={compressionLevel === "low"} onChange={() => setCompressionLevel("low")} className="mt-1 mr-3 text-green-600 focus:ring-green-500" disabled={status === "processing"} />
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">Low Compression</div>
                    <div className="text-xs text-slate-500">Highest quality, larger file size</div>
                  </div>
                </label>
                
                <label className={cn(
                  "flex items-start p-3 rounded-xl border cursor-pointer transition-colors",
                  compressionLevel === "medium" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}>
                  <input type="radio" name="compression" value="medium" checked={compressionLevel === "medium"} onChange={() => setCompressionLevel("medium")} className="mt-1 mr-3 text-green-600 focus:ring-green-500" disabled={status === "processing"} />
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">Medium Compression</div>
                    <div className="text-xs text-slate-500">Good balance of quality and size</div>
                  </div>
                </label>
                
                <label className={cn(
                  "flex items-start p-3 rounded-xl border cursor-pointer transition-colors",
                  compressionLevel === "high" ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}>
                  <input type="radio" name="compression" value="high" checked={compressionLevel === "high"} onChange={() => setCompressionLevel("high")} className="mt-1 mr-3 text-green-600 focus:ring-green-500" disabled={status === "processing"} />
                  <div>
                    <div className="font-medium text-sm text-slate-900 dark:text-white">High Compression</div>
                    <div className="text-xs text-slate-500">Smallest file size, lower quality</div>
                  </div>
                </label>
              </div>
              
              {originalFile && (
                <button 
                  onClick={startProcessing} 
                  disabled={status === "processing"}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {status === "processing" ? (
                    <><Loader2 className="animate-spin mr-2 w-5 h-5"/> Compressing...</>
                  ) : "Compress Image"}
                </button>
              )}
              
              {status === "error" && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start text-sm border border-red-200 dark:border-red-900/30">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {status === "success" && originalStats && compressedStats && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold uppercase text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-green-500"/>
                  File Information
                </h3>
                
                {isLarger ? (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-800">
                    The original image is already highly optimized. Compression skipped to preserve quality.
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50 text-center">
                     <p className="text-green-700 dark:text-green-400 font-bold text-2xl mb-1">-{savings.percent}%</p>
                     <p className="text-xs font-medium text-green-600 dark:text-green-500 uppercase">Space Saved ({formatSize(savings.saved)})</p>
                  </div>
                )}
                
                <div className="space-y-3 mt-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Original Size</p>
                    <div className="flex justify-between items-end">
                      <span className="font-semibold text-slate-900 dark:text-white">{formatSize(originalStats.size)}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Maximize className="w-3 h-3"/> {originalStats.width} × {originalStats.height}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  </div>
                  
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Compressed Size</p>
                    <div className="flex justify-between items-end">
                      <span className="font-semibold text-green-600 dark:text-green-400">{formatSize(compressedStats.size)}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1"><Maximize className="w-3 h-3"/> {compressedStats.width} × {compressedStats.height}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-3 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[600px] flex overflow-hidden relative">
             {!originalFile && status !== "error" && (
               <div className="m-auto w-full max-w-lg p-8">
                 <UploadArea onUpload={handleUpload} accept="image/jpeg, image/png, image/webp" />
               </div>
             )}
             
             {originalFile && (status === "idle" || status === "error") && (
               <div className="w-full h-full flex items-center justify-center p-4 bg-checkerboard">
                 <img src={originalUrl!} alt="Original" className="max-w-full max-h-full object-contain shadow-lg" />
               </div>
             )}
             
             {status === "processing" && (
               <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center z-20">
                 <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                 <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Compressing Image...</h2>
                 <p className="text-sm text-slate-500">Applying optimizations</p>
               </div>
             )}
             
             {status === "success" && compressedUrl && originalUrl && (
                <div className="w-full h-full bg-checkerboard">
                  <CompareSlider 
                    originalUrl={originalUrl} 
                    enhancedUrl={compressedUrl} 
                    className="w-full h-full"
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm pointer-events-none z-10">
                    Original
                  </div>
                  <div className="absolute top-4 right-4 bg-green-600/90 backdrop-blur text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm pointer-events-none z-10">
                    Compressed
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

