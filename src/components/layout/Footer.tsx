import { Link } from "react-router-dom";
import { Sparkles, Twitter, Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">
                Lumi AI
              </span>
            </Link>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Professional AI image enhancement tools for creators, photographers, and businesses.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase">
                  Tools
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/tool/upscaler" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      AI Image Upscaler
                    </Link>
                  </li>
                  <li>
                    <Link to="/tool/bg-remover" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Background Remover
                    </Link>
                  </li>
                  <li>
                    <Link to="/tool/face-enhancer" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Face Enhancer
                    </Link>
                  </li>
                  <li>
                    <Link to="/tool/compressor" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Image Compressor
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase">
                  Company
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/about" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/blog" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link to="/privacy" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/terms" className="text-base text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-base text-slate-400 xl:text-center">
            &copy; {new Date().getFullYear()} Lumi AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
