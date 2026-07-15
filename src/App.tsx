/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Upscaler from "./pages/tools/Upscaler";
import BackgroundRemover from "./pages/tools/BackgroundRemover";
import FaceEnhancer from "./pages/tools/FaceEnhancer";
import PhotoRestorer from "./pages/tools/PhotoRestorer";
import ImageGenerator from "./pages/tools/ImageGenerator";
import ImageExtender from "./pages/tools/ImageExtender";
import ImageCompressor from "./pages/tools/ImageCompressor";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-primary-500 selection:text-white transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/tool/upscaler" element={<ProtectedRoute><Upscaler /></ProtectedRoute>} />
              <Route path="/tool/bg-remover" element={<ProtectedRoute><BackgroundRemover /></ProtectedRoute>} />
              <Route path="/tool/face-enhancer" element={<ProtectedRoute><FaceEnhancer /></ProtectedRoute>} />
              <Route path="/tool/photo-restorer" element={<ProtectedRoute><PhotoRestorer /></ProtectedRoute>} />
              <Route path="/tool/image-generator" element={<ProtectedRoute><ImageGenerator /></ProtectedRoute>} />
              <Route path="/tool/image-extender" element={<ProtectedRoute><ImageExtender /></ProtectedRoute>} />
              <Route path="/tool/compressor" element={<ProtectedRoute><ImageCompressor /></ProtectedRoute>} />
              
              {/* Catch-all for other pages */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
