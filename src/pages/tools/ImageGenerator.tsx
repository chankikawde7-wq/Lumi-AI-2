import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ImageIcon, Sparkles, Sliders, Type, Image as ImagePlaceholder, Download,
  Maximize, RefreshCw, Pencil, ChevronRight, Settings, Loader2, Dice5
} from "lucide-react";
import { cn } from "../../lib/utils";

const styles = [
  "Realistic", "Ultra Realistic", "Cinematic", "Anime", "Cartoon", 
  "Fantasy", "3D Render", "Digital Art", "Oil Painting", "Watercolor", 
  "Pencil Sketch", "Pixel Art", "Logo", "Icon", "Sticker"
];

const aspectRatios = [
  { label: "1:1", value: "1:1" },
  { label: "3:4", value: "3:4" },
  { label: "4:3", value: "4:3" },
  { label: "9:16", value: "9:16" },
  { label: "16:9", value: "16:9" },
  { label: "21:9", value: "21:9" },
];

const sizes = [
  { label: "512×512", width: 512, height: 512 },
  { label: "768×768", width: 768, height: 768 },
  { label: "1024×1024", width: 1024, height: 1024 },
  { label: "1536×1536", width: 1536, height: 1536 },
  { label: "2048×2048", width: 2048, height: 2048 },
];

const promptSuggestions = [
  "A futuristic cyberpunk city at night with neon lights",
  "A cute magical cat wizard casting a spell, digital art",
  "A cozy cabin in the woods during autumn, realistic",
  "Astronaut floating in a colorful nebula, cinematic lighting"
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [size, setSize] = useState(sizes[2]); // Default 1024x1024
  const [quality, setQuality] = useState("HD");
  
  // AI Controls
  const [creativity, setCreativity] = useState("Medium");
  const [lighting, setLighting] = useState("None");
  const [cameraAngle, setCameraAngle] = useState("None");
  const [seed, setSeed] = useState("");

  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const generateRandomPrompt = () => {
    const random = promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)];
    setPrompt(random);
  };

  const handleGenerate = () => {
    if (!prompt) return;
    setStatus("generating");
    setProgress(0);
    setResultUrl(null);
    setImageLoaded(false);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 300);

    // Simulate generation using Pollinations.ai
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const fullPrompt = `${prompt}, ${style} style, ${lighting !== 'None' ? lighting + ' lighting' : ''}, ${cameraAngle !== 'None' ? cameraAngle + ' angle' : ''}, high quality, ${quality}`;
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const randomSeed = seed ? seed : Math.floor(Math.random() * 1000000);
      
      // Calculate aspect ratio width/height based on selected size
      let width = size.width;
      let height = size.height;
      if (aspectRatio !== "1:1") {
        const [w, h] = aspectRatio.split(":").map(Number);
        const baseSize = size.width;
        if (w > h) {
          width = baseSize;
          height = Math.floor(baseSize * (h / w));
        } else {
          height = baseSize;
          width = Math.floor(baseSize * (w / h));
        }
      }

      setResultUrl(`https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true`);
      setStatus("success");
    }, 4000);
  };

  const downloadImage = async (format: "png" | "jpg") => {
    if (!resultUrl) return;
    try {
      const response = await fetch(resultUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_image.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 flex flex-col md:flex-row">
      {/* Sidebar Controls */}
      <div className={cn(
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 z-10",
        isSidebarOpen ? "w-full md:w-80 lg:w-96 p-6 overflow-y-auto h-[calc(100vh-5rem)]" : "w-0 overflow-hidden"
      )}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Generation Settings
        </h2>

        <div className="space-y-6">
          {/* Style */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image Style</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            >
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatios.map(ar => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-lg border transition-colors",
                    aspectRatio === ar.value 
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500" 
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image Size</label>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map(s => (
                <button
                  key={s.label}
                  onClick={() => setSize(s)}
                  className={cn(
                    "py-2 text-xs font-medium rounded-lg border transition-colors relative",
                    size.label === s.label 
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-500" 
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quality</label>
            <select 
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            >
              <option value="Standard">Standard</option>
              <option value="HD">HD</option>
              <option value="Ultra HD">Ultra HD</option>
              <option value="4K">4K</option>
              <option value="Maximum AI Quality">Maximum AI Quality</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Advanced AI Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Creativity Level</label>
                <input 
                  type="range" min="1" max="3" step="1" 
                  value={creativity === "Low" ? 1 : creativity === "Medium" ? 2 : 3}
                  onChange={(e) => setCreativity(e.target.value === "1" ? "Low" : e.target.value === "2" ? "Medium" : "High")}
                  className="w-full accent-indigo-500" 
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Lighting</label>
                <select 
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none dark:text-white"
                >
                  <option value="None">None</option>
                  <option value="Cinematic">Cinematic</option>
                  <option value="Neon">Neon</option>
                  <option value="Natural">Natural</option>
                  <option value="Studio">Studio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Camera Angle</label>
                <select 
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none dark:text-white"
                >
                  <option value="None">None</option>
                  <option value="Wide Shot">Wide Shot</option>
                  <option value="Close up">Close up</option>
                  <option value="Drone View">Drone View</option>
                  <option value="Macro">Macro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Seed (Optional)</label>
                <input 
                  type="text" 
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Random"
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs outline-none dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
        {/* Top bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 md:hidden"
            >
              <Sliders className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-md">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">AI Image Generator</h1>
              <p className="text-xs text-slate-500">Transform text into stunning visual art</p>
            </div>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Prompt Input */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    What do you want to see?
                  </label>
                  <button 
                    onClick={generateRandomPrompt}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <Dice5 className="w-3 h-3" /> Random Prompt
                  </button>
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate in detail..."
                  className="w-full h-24 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Negative Prompt (What not to include)</label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g. blurry, low quality, distorted, extra fingers..."
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                />
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={!prompt || status === "generating"}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {status === "generating" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                  ) : (
                    <><ImageIcon className="w-5 h-5" /> Generate Image</>
                  )}
                </button>
              </div>
            </div>

            {/* Results Area */}
            {(status === "generating" || status === "success") && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[400px]">
                
                {status === "generating" && (
                  <div className="text-center w-full max-w-md">
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Crafting your image...</h3>
                    <p className="text-slate-500 mb-6 text-sm">AI is painting pixels based on your description.</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{progress}%</span>
                  </div>
                )}

                {status === "success" && resultUrl && (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generated Result</h3>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleGenerate}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-4 h-4" /> Regenerate
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-inner min-h-[300px]">
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 z-10">
                          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                          <p className="text-sm text-slate-500 font-medium">Downloading high-quality image...</p>
                        </div>
                      )}
                      <img 
                        src={resultUrl} 
                        alt={prompt} 
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                        referrerPolicy="no-referrer"
                        className={cn("max-w-full max-h-[600px] object-contain transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")}
                      />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button className="p-3 bg-white text-slate-900 rounded-full hover:scale-110 transition-transform" title="Full Screen">
                          <Maximize className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => downloadImage('png')}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                      >
                        <Download className="w-5 h-5" /> Download PNG
                      </button>
                      
                      <Link 
                        to={`/tool/upscaler?url=${encodeURIComponent(resultUrl)}`}
                        className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex justify-center items-center gap-2"
                      >
                        <Sparkles className="w-5 h-5" /> Enhance in Upscaler
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
