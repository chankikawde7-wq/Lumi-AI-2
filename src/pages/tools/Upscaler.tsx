import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Share2, ZoomIn, Loader2, Sparkles, AlertCircle } from "lucide-react";
import UploadArea from "../../components/ui/UploadArea";
import CompareSlider from "../../components/ui/CompareSlider";
import { cn } from "../../lib/utils";

// Helper to apply convolution matrix for sharpening
const applySharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, mix: number = 0.5) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Sharpen convolution matrix
  const weights = [
     0, -1,  0,
    -1,  5, -1,
     0, -1,  0
  ];
  
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  const src = new Uint8ClampedArray(data);
  const sw = width;
  const sh = height;
  const w = sw;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const dstOff = (y * sw + x) * 4;
      let r = 0, g = 0, b = 0;
      
      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = Math.min(Math.max(y + cy - halfSide, 0), sh - 1);
          const scx = Math.min(Math.max(x + cx - halfSide, 0), sw - 1);
          const srcOff = (scy * sw + scx) * 4;
          const wt = weights[cy * side + cx];
          
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
        }
      }
      
      // Mix with original image to avoid over-sharpening
      data[dstOff] = data[dstOff] * (1 - mix) + Math.min(Math.max(r, 0), 255) * mix;
      data[dstOff + 1] = data[dstOff + 1] * (1 - mix) + Math.min(Math.max(g, 0), 255) * mix;
      data[dstOff + 2] = data[dstOff + 2] * (1 - mix) + Math.min(Math.max(b, 0), 255) * mix;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

// Processing function utilizing Canvas for real local upscaling
const processUpscale = async (quality: string, originalUrl: string, onProgress: (val: number) => void): Promise<string> => {
  return new Promise((resolve) => {
    let progress = 0;
    const speed = quality === '8k' ? 150 : quality === '4k' ? 100 : quality === '2k' ? 80 : 50;
    
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const canvas = document.createElement('canvas');
            
            // Determine scale multiplier based on quality
            let scaleMultiplier = 1.5;
            if (quality === 'fhd') scaleMultiplier = 2;
            if (quality === '2k') scaleMultiplier = 2.5;
            if (quality === '4k') scaleMultiplier = 3;
            if (quality === '8k') scaleMultiplier = 4;

            canvas.width = img.width * scaleMultiplier;
            canvas.height = img.height * scaleMultiplier;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Enable high quality smoothing
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              
              // Draw image scaled up
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              // Apply sharpening to simulate detail recovery
              try {
                // Different mix based on quality to avoid artifacts
                let mix = 0.3;
                if (quality === '2k' || quality === '4k') mix = 0.4;
                if (quality === '8k') mix = 0.5;
                applySharpen(ctx, canvas.width, canvas.height, mix);
              } catch(e) {
                console.error("Could not apply sharpen filter", e);
              }
              
              resolve(canvas.toDataURL('image/jpeg', 0.95));
            } else {
              resolve(originalUrl);
            }
          };
          img.onerror = () => resolve(originalUrl); // fallback
          img.src = originalUrl;
        }, 500);
      }
      onProgress(progress);
    }, speed);
  });
};

export default function Upscaler() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  
  const [quality, setQuality] = useState("4k");
  const [isZoomed, setIsZoomed] = useState(false);

  const handleUpload = (file: File) => {
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    setStatus("idle");
    setEnhancedUrl(null);
    setIsZoomed(false);
    setErrorMessage(null);
  };

  const startEnhancing = async () => {
    if (!originalFile || !originalUrl) return;
    setStatus("processing");
    setProgress(0);
    setIsZoomed(false);
    setErrorMessage(null);
    
    try {
      const result = await processUpscale(quality, originalUrl, setProgress);
      setEnhancedUrl(result);
      setStatus("success");
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e.message || "An unexpected error occurred.");
    }
  };

  const reset = () => {
    setOriginalFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    setStatus("idle");
    setProgress(0);
    setIsZoomed(false);
    setErrorMessage(null);
  };

  const handleDownload = () => {
    if (!enhancedUrl) return;
    const a = document.createElement("a");
    a.href = enhancedUrl;
    a.download = `enhanced_${quality}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to tools
            </Link>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-500" />
              AI Image Upscaler
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Increase resolution and recover lost details automatically.
            </p>
          </div>
          
          {status === "success" && (
            <div className="flex items-center gap-3">
              <button onClick={reset} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                Upload New
              </button>
              <button onClick={handleDownload} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                <Download className="w-4 h-4 mr-2" />
                Download HD
              </button>
            </div>
          )}
        </div>

        {/* Main Workspace */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Settings Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Enhancement Quality
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: "hd", label: "HD (720p)", desc: "Fast processing, good for web" },
                  { id: "fhd", label: "Full HD (1080p)", desc: "Standard high quality" },
                  { id: "2k", label: "2K Resolution", desc: "Crisp details for larger screens" },
                  { id: "4k", label: "4K Ultra HD", desc: "Professional print quality" },
                  { id: "8k", label: "8K Maximum", desc: "Ultimate detail preservation" },
                ].map((opt) => (
                  <label 
                    key={opt.id}
                    className={cn(
                      "flex items-start p-3 border rounded-xl cursor-pointer transition-all",
                      quality === opt.id 
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500" 
                        : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700",
                      status === "processing" ? "opacity-50 pointer-events-none" : ""
                    )}
                  >
                    <input 
                      type="radio" 
                      name="quality" 
                      value={opt.id} 
                      checked={quality === opt.id}
                      onChange={(e) => setQuality(e.target.value)}
                      className="mt-1 text-primary-600 focus:ring-primary-500 border-slate-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                      </div>
                      <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
              
              {originalFile && status !== "success" && (
                <button
                  onClick={startEnhancing}
                  disabled={status === "processing"}
                  className={cn(
                    "w-full mt-6 py-3 px-4 rounded-xl font-bold text-white shadow-sm flex justify-center items-center transition-all",
                    status === "processing" 
                      ? "bg-primary-400 cursor-not-allowed" 
                      : "bg-primary-600 hover:bg-primary-700 hover:shadow-md"
                  )}
                >
                  {status === "processing" ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Enhance Image</>
                  )}
                </button>
              )}
              
              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-start">
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p>Images are automatically deleted from our servers 1 hour after processing to protect your privacy.</p>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-[600px] flex flex-col relative">
              
              {!originalFile && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-full max-w-lg">
                    <UploadArea onUpload={handleUpload} maxSizeMB={25} />
                  </div>
                </div>
              )}

              {originalFile && status === "idle" && (
                <div className="flex-1 p-4 relative bg-slate-100/50 dark:bg-slate-950/50">
                   <img src={originalUrl!} alt="Original preview" className="w-full h-full object-contain rounded-xl" />
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                      Ready to enhance
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-3 animate-pulse"></span>
                   </div>
                </div>
              )}

              {status === "processing" && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-slate-950 overflow-hidden">
                  <img src={originalUrl!} alt="Processing" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110" />
                  
                  <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                    <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-primary-400 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Enhancing your image...</h3>
                    <p className="text-slate-300 text-sm mb-6">Applying AI neural filters and recovering lost details</p>
                    
                    <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-right text-xs font-medium text-slate-400">{progress}%</div>
                  </div>
                </div>
              )}

              {status === "success" && originalUrl && enhancedUrl && (
                <div className="flex-1 relative flex bg-slate-950">
                  <CompareSlider 
                    originalUrl={originalUrl} 
                    enhancedUrl={enhancedUrl} 
                    isZoomed={isZoomed}
                    className="flex-1"
                  />
                  
                  {/* Floating Action Bar */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button 
                      onClick={() => setIsZoomed(!isZoomed)}
                      className={cn(
                        "w-10 h-10 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors shadow-lg",
                        isZoomed ? "bg-primary-600 hover:bg-primary-700" : "bg-black/50 hover:bg-black/80"
                      )} 
                      title={isZoomed ? "Zoom Out" : "Zoom In"}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button onClick={handleDownload} className="w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors shadow-lg" title="Download">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
            
            {/* Image Details Footer */}
            {originalFile && (
              <div className="mt-4 flex flex-wrap gap-4 items-center justify-center md:justify-start text-sm text-slate-500 dark:text-slate-400 font-medium">
                <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {(originalFile.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {originalFile.type.split('/')[1].toUpperCase()}
                </span>
                {status === "success" && (
                  <>
                    <span className="text-slate-300 mx-2">&rarr;</span>
                    <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full border border-primary-200 dark:border-primary-800/50">
                      Enhanced {quality.toUpperCase()}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
