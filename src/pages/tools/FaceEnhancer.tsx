import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Sparkles, AlertCircle, ZoomIn } from "lucide-react";
import UploadArea from "../../components/ui/UploadArea";
import CompareSlider from "../../components/ui/CompareSlider";
import { cn } from "../../lib/utils";

// Helper to apply convolution matrix for sharpening
const applySharpen = (ctx: CanvasRenderingContext2D, width: number, height: number, mix: number = 0.5) => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
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
  const h = sh;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dstOff = (y * w + x) * 4;
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
      
      data[dstOff] = data[dstOff] * (1 - mix) + Math.min(Math.max(r, 0), 255) * mix;
      data[dstOff + 1] = data[dstOff + 1] * (1 - mix) + Math.min(Math.max(g, 0), 255) * mix;
      data[dstOff + 2] = data[dstOff + 2] * (1 - mix) + Math.min(Math.max(b, 0), 255) * mix;
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export default function FaceEnhancer() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  
  const [options, setOptions] = useState({
    skinClarity: true,
    eyeEnhancement: true,
    teethEnhancement: true
  });

  const handleUpload = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      setStatus("error");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 20MB.");
      setStatus("error");
      return;
    }

    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setStatus("idle");
    setEnhancedUrl(null);
    setErrorMsg("");
    setIsZoomed(false);
  };

  const processImage = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          
          if (!ctx) {
            reject(new Error("Could not initialize canvas context"));
            return;
          }

          // Build filter string based on options
          let filterString = "contrast(1.05) saturate(1.1)";
          
          if (options.skinClarity) {
            // Slight blur then sharpen technique for skin clarity simulation
            ctx.filter = "blur(1px)";
            ctx.drawImage(img, 0, 0);
            ctx.globalAlpha = 0.5;
            ctx.filter = "none";
            ctx.drawImage(img, 0, 0);
            ctx.globalAlpha = 1.0;
          }
          
          if (options.teethEnhancement || options.eyeEnhancement) {
            filterString += " brightness(1.08)";
          }
          
          ctx.filter = filterString;
          ctx.drawImage(img, 0, 0);
          
          // Apply sharpening for detail recovery
          if (options.eyeEnhancement || options.skinClarity) {
            applySharpen(ctx, canvas.width, canvas.height, 0.3);
          }
          
          resolve(canvas.toDataURL("image/jpeg", 0.95));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image for processing"));
      img.src = imageUrl;
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file);
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          // If compression made it smaller, use the compressed one
          resolve(newFile.size < file.size ? newFile : file);
        }, file.type, 0.85);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const startEnhancing = async () => {
    if (!originalFile) return;
    setStatus("processing");
    setProgress(0);
    setErrorMsg("");
    setIsZoomed(false);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 5) + 2;
      });
    }, 100);

    try {
      // Small timeout to allow UI to update to processing state
      await new Promise(r => setTimeout(r, 100));
      
      // Compress if larger than 1MB
      let fileToProcess = originalFile;
      if (originalFile.size > 1024 * 1024) {
        fileToProcess = await compressImage(originalFile);
        // Need to update the URL for the processImage function
        const compressedUrl = URL.createObjectURL(fileToProcess);
        const resultUrl = await processImage(compressedUrl);
        URL.revokeObjectURL(compressedUrl);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          setEnhancedUrl(resultUrl);
          setStatus("success");
        }, 300);
      } else {
        const resultUrl = await processImage(originalUrl!);
        
        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          setEnhancedUrl(resultUrl);
          setStatus("success");
        }, 300);
      }
      
    } catch (e: any) {
      clearInterval(progressInterval);
      console.error(e);
      setErrorMsg(e.message || "Failed to process image");
      setStatus("error");
    }
  };

  const reset = () => {
    setOriginalFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setEnhancedUrl(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
    setIsZoomed(false);
  };

  const handleDownload = (format: "png" | "jpg" = "jpg") => {
    if (!enhancedUrl) return;
    const a = document.createElement("a");
    a.href = enhancedUrl;
    a.download = `enhanced_face_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 mb-2 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"><ArrowLeft className="w-4 h-4 mr-1"/> Back to tools</Link>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 dark:text-white"><Sparkles className="w-8 h-8 text-pink-500" /> Face Enhancer</h1>
          </div>
          {status === "success" && (
             <div className="flex gap-3">
                <button onClick={reset} className="px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Upload New</button>
                <button onClick={() => handleDownload("jpg")} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 transition-colors text-sm font-medium text-white rounded-lg flex items-center shadow-sm"><Download className="w-4 h-4 mr-2"/> Download HD</button>
             </div>
          )}
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold mb-4 uppercase text-sm text-slate-900 dark:text-white">Enhancement Options</h3>
              
              <label className="flex items-center mb-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={options.skinClarity} onChange={(e) => setOptions({...options, skinClarity: e.target.checked})} disabled={status === "processing"} className="mr-3 rounded text-pink-600 focus:ring-pink-500 w-4 h-4" /> 
                Skin clarity
              </label>
              <label className="flex items-center mb-3 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={options.eyeEnhancement} onChange={(e) => setOptions({...options, eyeEnhancement: e.target.checked})} disabled={status === "processing"} className="mr-3 rounded text-pink-600 focus:ring-pink-500 w-4 h-4" /> 
                Eye enhancement
              </label>
              <label className="flex items-center mb-4 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input type="checkbox" checked={options.teethEnhancement} onChange={(e) => setOptions({...options, teethEnhancement: e.target.checked})} disabled={status === "processing"} className="mr-3 rounded text-pink-600 focus:ring-pink-500 w-4 h-4" /> 
                Teeth enhancement
              </label>
              
              {originalFile && status !== "success" && (
                <button onClick={startEnhancing} disabled={status === "processing"} className="w-full mt-2 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                  {status === "processing" ? (
                    <>
                      <Loader2 className="animate-spin mr-2 w-5 h-5"/>
                      Processing...
                    </>
                  ) : "Enhance Face"}
                </button>
              )}
            </div>

            {status === "error" && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start text-sm border border-red-200 dark:border-red-900/30">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 h-[600px] flex overflow-hidden shadow-sm relative">
             {!originalFile && status !== "error" && <div className="m-auto w-full max-w-lg p-8"><UploadArea onUpload={handleUpload} /></div>}
             
             {originalFile && (status === "idle" || status === "error") && (
               <img src={originalUrl!} alt="Original" className="w-full h-full object-contain p-4 bg-slate-100 dark:bg-slate-950" />
             )}
             
             {status === "processing" && (
               <div className="m-auto text-center">
                 <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4"/>
                 <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Enhancing Details...</h2>
                 <div className="w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto mt-4">
                   <div className="h-full bg-pink-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-sm text-slate-500 mt-2">{progress}%</p>
               </div>
             )}
             
             {status === "success" && (
                <div className="relative w-full h-full flex">
                  <CompareSlider 
                    originalUrl={originalUrl!} 
                    enhancedUrl={enhancedUrl!} 
                    isZoomed={isZoomed}
                    className="flex-1 bg-slate-950"
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    <button 
                      onClick={() => setIsZoomed(!isZoomed)}
                      className={cn(
                        "w-10 h-10 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors shadow-lg",
                        isZoomed ? "bg-pink-600 hover:bg-pink-700" : "bg-black/50 hover:bg-black/80"
                      )} 
                      title={isZoomed ? "Zoom Out" : "Zoom In"}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDownload("jpg")} className="w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur text-white rounded-full flex items-center justify-center transition-colors shadow-lg" title="Download">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

