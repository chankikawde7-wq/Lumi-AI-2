import { Link } from "react-router-dom";
import { User, Settings, Image as ImageIcon, DownloadCloud, Crown, LogOut, ChevronRight, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("recent-enhancements");
  const { currentUser, userProfile, logout } = useAuth();
  
  // Combine auth profile with mock data for display
  const user = {
    name: userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : "User",
    email: currentUser?.email || "user@example.com",
    isPremium: false,
    credits: 5,
    maxCredits: 5
  };

  const mockHistory = [
    { id: 1, name: "IMG_9042.jpg", tool: "AI Upscaler", date: "2 hours ago", status: "completed", url: "https://images.unsplash.com/photo-1555448248-2571daf6344b?auto=format&fit=crop&q=80&w=300" },
    { id: 2, name: "profile_pic.png", tool: "Background Remover", date: "Yesterday", status: "completed", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300" },
    { id: 3, name: "old_family_photo.jpg", tool: "Photo Restorer", date: "3 days ago", status: "completed", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300" },
    { id: 4, name: "landscape_expanded.png", tool: "AI Image Extender", date: "1 week ago", status: "completed", url: "https://images.unsplash.com/photo-1506744626753-dfbf0bf35d2c?auto=format&fit=crop&q=80&w=300" },
    { id: 5, name: "avatar_gen.jpg", tool: "AI Image Generator", date: "1 week ago", status: "completed", url: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=300" },
    { id: 6, name: "compressed_logo.png", tool: "Image Compressor", date: "2 weeks ago", status: "completed", url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&q=80&w=300" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xl">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">{user.name}</h2>
                  <p className="text-sm text-slate-500 truncate max-w-[150px] sm:max-w-[180px] lg:max-w-[150px]">{user.email}</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab("recent-enhancements")}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                      activeTab === "recent-enhancements" 
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" 
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    <ImageIcon className="w-5 h-5" /> Recent Enhancements
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("downloads")}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                      activeTab === "downloads" 
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" 
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    <DownloadCloud className="w-5 h-5" /> Downloads
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                      activeTab === "settings" 
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" 
                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                    )}
                  >
                    <Settings className="w-5 h-5" /> Account Settings
                  </button>
                </li>
                <li className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <button onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden h-full min-h-[600px]">
              
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                  {activeTab.replace('-', ' ')}
                </h2>
                <Link to="/" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
                  Go to Tools &rarr;
                </Link>
              </div>
              
              {/* Content */}
              <div className="p-8">
                {activeTab === "recent-enhancements" && (
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                      Your recently processed images. Images are automatically deleted from our servers after 1 hour for your privacy.
                    </p>
                    
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {mockHistory.map((item) => (
                        <div key={item.id} className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all bg-slate-50 dark:bg-slate-950">
                          <div className="aspect-square relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                               <button className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                                 Download
                               </button>
                               <button className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 hover:scale-105 transition-all">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-white truncate pr-2" title={item.name}>{item.name}</h3>
                              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">{item.tool}</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Profile Information</h3>
                    <div className="space-y-4 mb-10">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input type="text" defaultValue={user.name} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                        <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 cursor-not-allowed" />
                      </div>
                      <button className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
                        Save Changes
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Preferences</h3>
                    <div className="space-y-4">
                       <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                          <div>
                             <span className="block font-medium text-slate-900 dark:text-white">Email Notifications</span>
                             <span className="text-sm text-slate-500">Receive updates about your account and new features.</span>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                       </label>
                       <label className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer">
                          <div>
                             <span className="block font-medium text-slate-900 dark:text-white">Auto-Delete Images</span>
                             <span className="text-sm text-slate-500">Delete processed images immediately after download.</span>
                          </div>
                          <input type="checkbox" className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-slate-300" />
                       </label>
                    </div>
                  </div>
                )}
                
                {activeTab === "downloads" && (
                   <div className="text-center py-20">
                     <DownloadCloud className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No downloads yet</h3>
                     <p className="text-slate-500">Your downloaded images will appear here.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
