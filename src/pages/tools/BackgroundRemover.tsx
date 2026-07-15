import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Crop, Loader2, AlertCircle } from "lucide-react";
import UploadArea from "../../components/ui/UploadArea";
import CompareSlider from "../../components/ui/CompareSlider";
import { cn } from "../../lib/utils";

export default function BackgroundRemover() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [bgColor, setBgColor] = useState("transparent");
  const [errorMsg, setErrorMsg] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleUpload = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Please upload a JPG, PNG, or WEBP image.");
      setStatus("error");
      return;
    }

    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File is too large. Maximum size is 10MB.");
      setStatus("error");
      return;
    }

    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setStatus("idle");
    setEnhancedUrl(null);
    setErrorMsg("");
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

    abortControllerRef.current = new AbortController();

    // Fake progress interval for better UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 500);

    try {
      // Compress if larger than 1MB
      let fileToUpload = originalFile;
      if (originalFile.size > 1024 * 1024) {
        fileToUpload = await compressImage(originalFile);
      }

      const formData = new FormData();
      formData.append("image", fileToUpload);
      formData.append("bgColor", bgColor);

      const response = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to process image");
      }

      const blob = await response.blob();
      const resultUrl = URL.createObjectURL(blob);
      setEnhancedUrl(resultUrl);
      setStatus("success");
    } catch (e: any) {
      clearInterval(progressInterval);
      if (e.name === "AbortError") {
        setErrorMsg("Processing cancelled");
      } else {
        setErrorMsg(e.message || "A network or API error occurred");
      }
      setStatus("error");
    }
  };

  const reset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setOriginalFile(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(null);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setEnhancedUrl(null);
    setStatus("idle");
    setProgress(0);
    setErrorMsg("");
  };

  const handleDownload = async (format: "png" | "jpg") => {
    if (!enhancedUrl) return;
    
    let downloadUrl = enhancedUrl;
    
    if (format === "jpg") {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = enhancedUrl;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          // Fill white background for JPG if it was transparent
          ctx.fillStyle = bgColor === "transparent" ? "#FFFFFF" : 
                          bgColor === "black" ? "#000000" : bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          downloadUrl = canvas.toDataURL("image/jpeg", 0.95);
        }
      } catch (e) {
        console.error("Error converting to JPG:", e);
      }
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `removed_bg_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-2"><ArrowLeft className="w-4 h-4 mr-1"/> Back to tools</Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3"><Crop className="w-8 h-8 text-purple-500" /> Background Remover</h1>
          </div>
          {status === "success" && (
            <div className="flex items-center gap-3">
              <button onClick={reset} className="px-4 py-2 border rounded-lg bg-white dark:bg-slate-900 text-sm font-medium">Upload New</button>
              <button onClick={() => handleDownload("png")} className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center text-sm font-medium"><Download className="w-4 h-4 mr-2"/> Download PNG</button>
              <button onClick={() => handleDownload("jpg")} className="px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg flex items-center text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><Download className="w-4 h-4 mr-2"/> Download JPG (HD)</button>
            </div>
          )}
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold mb-4 uppercase text-sm">Background Option</h3>
              <div className="space-y-3">
                {[
                  { id: "transparent", label: "Transparent", desc: "Best for web" },
                  { id: "white", label: "White", desc: "Best for eCommerce" },
                  { id: "black", label: "Black", desc: "Best for portraits" },
                  { id: "custom", label: "Custom Color", desc: "Pick your own" }
                ].map((opt) => (
                  <label key={opt.id} className={cn("flex items-start p-3 border rounded-xl cursor-pointer transition-all", (bgColor === opt.id || (opt.id === "custom" && !["transparent", "white", "black"].includes(bgColor))) ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500" : "border-slate-200 dark:border-slate-700")}>
                    <input 
                      type="radio" 
                      name="bg" 
                      value={opt.id} 
                      checked={bgColor === opt.id || (opt.id === "custom" && !["transparent", "white", "black"].includes(bgColor))} 
                      onChange={(e) => {
                        if (e.target.value === "custom") {
                          setBgColor("#eab308"); // Default custom color
                        } else {
                          setBgColor(e.target.value);
                        }
                      }} 
                      disabled={status === "processing"} 
                      className="mt-1 text-primary-600 focus:ring-primary-500" 
                    />
                    <div className="ml-3 flex-1">
                      <span className="block text-sm font-semibold">{opt.label}</span>
                      {opt.id === "custom" && !["transparent", "white", "black"].includes(bgColor) ? (
                        <div className="mt-2 flex items-center gap-2">
                          <input 
                            type="color" 
                            value={bgColor} 
                            onChange={(e) => setBgColor(e.target.value)}
                            disabled={status === "processing"}
                            className="h-8 w-14 cursor-pointer rounded bg-transparent p-0"
                          />
                          <span className="text-xs text-slate-500 font-mono uppercase">{bgColor}</span>
                        </div>
                      ) : (
                        <span className="block text-xs text-slate-500 mt-0.5">{opt.desc}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              {originalFile && status !== "success" && (
                <button onClick={startEnhancing} disabled={status === "processing"} className={cn("w-full mt-6 py-3 px-4 rounded-xl font-bold text-white shadow-sm flex justify-center items-center transition-all", status === "processing" ? "bg-primary-400" : "bg-primary-600 hover:bg-primary-700")}>
                  {status === "processing" ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing...</> : <>Remove Background</>}
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
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[600px] flex overflow-hidden">
             {!originalFile && status !== "error" && <div className="m-auto w-full max-w-lg p-8"><UploadArea onUpload={handleUpload} /></div>}
             {originalFile && (status === "idle" || status === "error") && <img src={originalUrl!} alt="Original" className="w-full h-full object-contain p-4 bg-slate-100 dark:bg-slate-950" />}
             {status === "processing" && (
               <div className="m-auto text-center">
                 <Crop className="w-12 h-12 animate-pulse text-purple-500 mx-auto mb-4"/>
                 <h2 className="text-xl font-semibold mb-2">Removing Background...</h2>
                 <div className="w-64 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mx-auto">
                   <div className="h-full bg-purple-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-sm text-slate-500 mt-2">{progress}%</p>
               </div>
             )}
             {status === "success" && (
               <div 
                 className={cn("flex-1", bgColor === "transparent" ? "bg-checkerboard" : "")} 
                 style={bgColor !== "transparent" ? { backgroundColor: bgColor } : {}}
               >
                 <CompareSlider originalUrl={originalUrl!} enhancedUrl={enhancedUrl!} className="w-full h-full bg-transparent"/>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
