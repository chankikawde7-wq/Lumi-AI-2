import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ImageIcon, Loader2, Download, Maximize2, Zap, 
  Settings2, Expand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  MoveHorizontal, MoveVertical, Move, AlertCircle, RefreshCw, Upload, Camera
} from "lucide-react";
import { cn } from "../../lib/utils";
import UploadArea from "../../components/ui/UploadArea";

const DIRECTIONS = [
  { id: "top", label: "Top", icon: ArrowUp },
  { id: "bottom", label: "Bottom", icon: ArrowDown },
  { id: "left", label: "Left", icon: ArrowLeft },
  { id: "right", label: "Right", icon: ArrowRight },
  { id: "horizontal", label: "Left + Right", icon: MoveHorizontal },
  { id: "vertical", label: "Top + Bottom", icon: MoveVertical },
  { id: "all", label: "All Sides", icon: Move },
];

const ASPECT_RATIOS = [
  "Original", "1:1", "4:5", "3:4", "4:3", "16:9", "9:16", "21:9"
];

const AI_MODES = [
  "Auto Detect", "Realistic", "Nature", "Portrait", "Architecture", "Anime", "Digital Art"
];

const EXPORT_QUALITIES = [
  { label: "HD" },
  { label: "2K" },
  { label: "4K" },
  { label: "8K" },
];

const EXPORT_FORMATS = ["JPG", "PNG", "WEBP"];

export default function ImageExtender() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  
  const [direction, setDirection] = useState("all");
  const [aspectRatio, setAspectRatio] = useState("Original");
  const [aiMode, setAiMode] = useState("Auto Detect");
  
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  const [exportQuality, setExportQuality] = useState("HD");
  const [exportFormat, setExportFormat] = useState("JPG");

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleUpload = (uploadedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(uploadedFile.type)) {
      setErrorMsg("Unsupported format. Please upload JPG, PNG or WEBP.");
      return;
    }

    // Validate file size (25MB)
    if (uploadedFile.size > 25 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 25MB.");
      return;
    }

    const url = URL.createObjectURL(uploadedFile);
    
    // Validate image dimensions (simulate checking if it's too small)
    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setErrorMsg("Image is too small. Please upload an image with higher resolution.");
        URL.revokeObjectURL(url);
        return;
      }
      setFile(uploadedFile);
      setOriginalUrl(url);
      setStatus("idle");
      setResultUrl(null);
      setErrorMsg("");
    };
    img.src = url;
  };

  const generateExtendedImage = async (originalFileUrl: string, dir: string) => {
    return new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas not supported");
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const base64Image = canvas.toDataURL("image/jpeg", 0.9);
        
        try {
          const response = await fetch("/api/extend-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              direction: dir,
              aiMode: aiMode,
              aspectRatio: aspectRatio,
            }),
            signal: abortControllerRef.current?.signal,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error ${response.status}`);
          }
          
          const data = await response.json();
          resolve(data.resultUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = originalFileUrl;
    });
  };

  const handleProcess = async () => {
    if (!file || !originalUrl) return;
    
    if (!navigator.onLine) {
      setStatus("error");
      setErrorMsg("Internet Connection Lost. Please check your network and try again.");
      return;
    }

    setStatus("processing");
    setProgress(0);
    setErrorMsg("");
    setResultUrl(null);
    setImageLoaded(false);

    abortControllerRef.current = new AbortController();

    // Fake progress interval for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 400);

    try {
      const extendedUrl = await generateExtendedImage(originalUrl, direction);
      clearInterval(progressInterval);
      setProgress(100);
      setStatus("success");
      setResultUrl(extendedUrl);
    } catch (err: any) {
      clearInterval(progressInterval);
      if (err.name === 'AbortError') return;
      setStatus("error");
      setErrorMsg(err.message || "Failed to generate image. Please try again.");
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus("idle");
    setProgress(0);
  };

  const resetAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setFile(null);
    setResultUrl(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
  };

  const handleDownload = async () => {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `extended-image-${direction}-${aiMode.toLowerCase()}.${exportFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            &larr; Back to Tools
          </Link>
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg shrink-0">
                <Expand className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">AI Image Extender</h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Expand your images naturally in any direction</p>
              </div>
            </div>
            
            {originalUrl && status !== "processing" && (
              <button 
                onClick={resetAll}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors self-start md:self-auto"
              >
                Upload New Image
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Controls (Only show if image is uploaded) */}
          <div className={cn("space-y-6 transition-all", originalUrl ? "lg:col-span-4" : "hidden")}>
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Direction */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Extend Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DIRECTIONS.map(dir => (
                    <button
                      key={dir.id}
                      onClick={() => setDirection(dir.id)}
                      className={cn(
                        "flex items-center p-2 rounded-lg border transition-colors text-sm",
                        direction === dir.id
                          ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900",
                        dir.id === "all" ? "col-span-2 justify-center" : "gap-2"
                      )}
                    >
                      <dir.icon className={cn("w-4 h-4 shrink-0", dir.id === "all" ? "mr-2" : "")} />
                      <span className="font-medium truncate">{dir.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                  Target Aspect Ratio
                </label>
                <div className="flex flex-wrap gap-2">
                  {ASPECT_RATIOS.map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
                        aspectRatio === ratio
                          ? "bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                      )}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                  AI Context Mode
                </label>
                <select 
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                >
                  {AI_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  "Auto Detect" will analyze your image and automatically choose the best extension style.
                </p>
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={status === "processing"}
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Extending ({progress}%)...
                </>
              ) : (
                <>
                  <Expand className="w-5 h-5" />
                  Extend Image
                </>
              )}
            </button>
          </div>

          {/* Right Column - Workspace */}
          <div className={cn("transition-all", originalUrl ? "lg:col-span-8" : "lg:col-span-12 max-w-3xl mx-auto w-full")}>
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[600px] flex flex-col">
              
              {!originalUrl && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Upload an Image</h2>
                      <p className="text-slate-500">Supported formats: JPG, PNG, WEBP (Max 25MB)</p>
                    </div>
                    <UploadArea 
                      onUpload={handleUpload} 
                      maxSizeMB={25} 
                    />
                  </div>
                </div>
              )}

              {originalUrl && status === "idle" && !resultUrl && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Preview & Settings</h3>
                    <p className="text-sm text-slate-500">Configure your extension settings on the left panel, then click Extend Image.</p>
                  </div>
                  <div className="flex-1 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 p-4 relative">
                    <img src={originalUrl} alt="Original" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-sm" />
                    
                    {/* Visual Indicator of expansion direction */}
                    <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-orange-500/50 rounded-xl">
                       <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded shadow-sm opacity-80 flex items-center gap-1">
                          <Expand className="w-3 h-3" /> Preview Frame
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {status === "processing" && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
                    <div 
                      className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Expand className="w-8 h-8 text-orange-500 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expanding your image...</h3>
                  <p className="text-slate-500 mb-6">AI is seamlessly extending boundaries and filling details.</p>
                  
                  <div className="w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden mx-auto">
                    <div className="bg-orange-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400 block mb-6">{progress}%</span>
                  
                  <button 
                    onClick={handleCancel}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {status === "success" && resultUrl && (
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extended Result</h3>
                    <div className="flex gap-2">
                       <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center">
                          <Expand className="w-4 h-4 mr-2" /> Compare
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center group border border-slate-200 dark:border-slate-800">
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 z-10">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                        <p className="text-sm text-slate-500 font-medium">Loading high-resolution result...</p>
                      </div>
                    )}
                    <img 
                      src={resultUrl} 
                      alt="Extended Result" 
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
                      referrerPolicy="no-referrer"
                      className={cn("max-w-full max-h-[500px] object-contain shadow-md transition-opacity duration-300 rounded-lg", imageLoaded ? "opacity-100" : "opacity-0")}
                    />
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm pointer-events-none">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                        <Maximize2 className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Export Options */}
                  <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Format</label>
                        <select 
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none font-medium dark:text-white"
                        >
                          {EXPORT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Quality</label>
                        <select 
                          value={exportQuality}
                          onChange={(e) => setExportQuality(e.target.value)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none font-medium dark:text-white"
                        >
                          {EXPORT_QUALITIES.map(q => <option key={q.label} value={q.label}>{q.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleDownload}
                      className="w-full md:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Download Result
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-start text-sm border border-red-200 dark:border-red-900/30">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
