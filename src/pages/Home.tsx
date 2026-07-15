import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ImageIcon, Sparkles, Wand2, Maximize, Crop, Zap, Star, Shield, Lock, Trash2, Heart, CheckCircle2, Expand } from "lucide-react";
import UploadArea from "../components/ui/UploadArea";

const tools = [
  {
    id: "upscaler",
    name: "AI Image Upscaler",
    description: "Increase resolution up to 8K without losing quality. Perfect for printing and large displays.",
    icon: Maximize,
    color: "bg-blue-500",
  },
  {
    id: "image-generator",
    name: "AI Image Generator",
    description: "Generate stunning high-quality images from text descriptions using advanced AI models.",
    icon: ImageIcon,
    color: "bg-emerald-500",
  },
  {
    id: "bg-remover",
    name: "Background Remover",
    description: "Instantly remove or replace backgrounds with precise hair edge detection.",
    icon: Crop,
    color: "bg-purple-500",
  },
  {
    id: "face-enhancer",
    name: "Face Enhancer",
    description: "Restore blurry faces, improve skin clarity, and enhance facial lighting naturally.",
    icon: Sparkles,
    color: "bg-pink-500",
  },
  {
    id: "photo-restorer",
    name: "Old Photo Restorer",
    description: "Repair cracks, remove scratches, and colorize black & white vintage photos.",
    icon: Wand2,
    color: "bg-amber-500",
  },
  {
    id: "image-extender",
    name: "AI Image Extender",
    description: "Expand image boundaries in any direction while seamlessly generating new content.",
    icon: Expand,
    color: "bg-orange-500",
  },
  {
    id: "compressor",
    name: "Image Compressor",
    description: "Reduce file size massively without noticeable quality loss. Fast and secure.",
    icon: Zap,
    color: "bg-green-500",
  },
];

const features = [
  { name: "Lightning Fast Processing", description: "Get your enhanced images in seconds, not minutes.", icon: Zap },
  { name: "Privacy First", description: "Images are auto-deleted after processing. No permanent storage.", icon: Shield },
  { name: "Bank-Grade Security", description: "All transfers are secured with SSL/TLS encryption.", icon: Lock },
  { name: "Artifact-Free AI", description: "Advanced models preserve natural textures and avoid over-sharpening.", icon: Star },
];

export default function Home() {
  const navigate = useNavigate();

  const handleUpload = (file: File) => {
    // In a real app, we would store this file in a global state or context
    // and navigate to the upscaler tool with it. For the demo, we just navigate.
    navigate("/tool/upscaler");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100/50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium text-sm mb-8 border border-primary-200/50 dark:border-primary-800/50">
            <Sparkles className="w-4 h-4" />
            <span>The #1 AI Image Enhancer</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-6">
            Make every image <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
              pixel perfect
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10">
            Upscale, enhance, restore, and refine your photos in one click with state-of-the-art artificial intelligence. Professional quality, built for everyone.
          </p>
          
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 p-2 sm:p-4 rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/50 border border-slate-200 dark:border-slate-800">
            <UploadArea onUpload={handleUpload} />
            <p className="text-sm text-slate-500 mt-4 text-center pb-2">
              By uploading an image, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to perfect your images
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Six powerful AI tools designed to solve your most common image editing challenges in seconds.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link 
                key={tool.id} 
                to={`/tool/${tool.id}`}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-6 ${tool.color} shadow-lg`}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {tool.name}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">
                  {tool.description}
                </p>
                <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium group-hover:gap-2 transition-all">
                  Try it now <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works & Features */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">
                Professional quality, zero effort required.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                We've trained our AI models on millions of high-resolution images so it knows exactly how to add missing details, remove noise, and enhance colors naturally.
              </p>
              
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.name} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                      <feature.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                        {feature.name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl opacity-20 blur-2xl"></div>
              <div className="relative bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
                 <div className="aspect-[4/3] flex items-center justify-center relative p-8">
                    {/* Simulated before/after comparison abstract visual */}
                    <div className="absolute inset-0 bg-slate-800 w-1/2 overflow-hidden border-r-2 border-white">
                       <div className="absolute inset-0 w-[200%] h-full flex items-center justify-center opacity-50 blur-sm">
                          <img src="https://images.unsplash.com/photo-1555448248-2571daf6344b?auto=format&fit=crop&q=40&w=800" className="object-cover w-full h-full" alt="Blurry" />
                       </div>
                       <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">BEFORE</div>
                    </div>
                    <div className="absolute inset-0 bg-slate-900 w-1/2 left-1/2 overflow-hidden">
                       <div className="absolute inset-0 w-[200%] h-full -left-full flex items-center justify-center">
                          <img src="https://images.unsplash.com/photo-1555448248-2571daf6344b?auto=format&fit=crop&q=100&w=800" className="object-cover w-full h-full" alt="Sharp" />
                       </div>
                       <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">AFTER</div>
                    </div>
                    
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-1 h-4 bg-slate-300 rounded-full mr-1"></div>
                      <div className="w-1 h-4 bg-slate-300 rounded-full"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-10 h-10 text-rose-500 mx-auto mb-6" />
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-12">
            Loved by over 100,000 creators
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 italic">
                  "This tool completely transformed my workflow. I used to spend hours manually restoring old family photos in Photoshop, and now it takes me exactly 5 seconds."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">Sarah Jenkins</h5>
                    <span className="text-slate-500 text-xs">Professional Photographer</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary-600 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-display font-bold text-white mb-6">
            Ready to enhance your images?
          </h2>
          <p className="text-primary-100 text-lg lg:text-xl mb-10">
            Join thousands of users who trust Lumi AI for their image editing needs. Free accounts get 5 HD enhancements per day.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard" className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-primary-900 shadow-lg hover:bg-slate-50 hover:scale-105 transition-all">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
