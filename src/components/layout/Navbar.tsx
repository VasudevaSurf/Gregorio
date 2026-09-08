"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hideMenu, setHideMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Fade out menu button when user scrolls down into overlapping sections
      setHideMenu(window.scrollY > 250);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Main Top Header Bar (Disappears when scrolling down) */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 flex items-center justify-between pointer-events-none">
        {/* Left: Minimal Hamburger Button */}
        <button
          onClick={() => setMenuOpen(true)}
          className={cn(
            "pointer-events-auto group flex items-center gap-3 py-2.5 px-4 rounded-full border border-white/20 bg-black/40 hover:bg-black/80 backdrop-blur-xl text-white shadow-lg transition-all duration-500 transform-gpu cursor-pointer",
            hideMenu ? "opacity-0 pointer-events-none scale-90 -translate-y-4" : "opacity-100 scale-100 translate-y-0"
          )}
          aria-label="Open Menu"
        >
          <div className="flex flex-col gap-[4px] w-4 items-center">
            <span className="w-4 h-[1.5px] bg-white group-hover:w-5 transition-all duration-300" />
            <span className="w-2.5 h-[1.5px] bg-amber-400 group-hover:w-5 transition-all duration-300" />
            <span className="w-4 h-[1.5px] bg-white group-hover:w-5 transition-all duration-300" />
          </div>
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-neutral-200 group-hover:text-white">
            Menu
          </span>
        </button>
      </header>

      {/* Full-Screen Minimal Menu Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl text-white flex flex-col justify-between p-8 sm:p-16"
          >
            {/* Top Close Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-semibold">
                Directory
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto max-w-5xl mx-auto w-full">
              <div className="space-y-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold">
                  Sections
                </span>
                <nav className="flex flex-col gap-5 font-serif text-3xl sm:text-5xl font-light">
                  <Link
                    href="#hero"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-amber-300 transition-colors flex items-center justify-between group"
                  >
                    <span>01. Hero</span>
                    <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link
                    href="#section-narrative"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-amber-300 transition-colors flex items-center justify-between group"
                  >
                    <span>02. Section Two</span>
                    <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link
                    href="#section-three"
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-amber-300 transition-colors flex items-center justify-between group"
                  >
                    <span>03. Section Three</span>
                    <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </nav>
              </div>

              <div className="space-y-4 flex flex-col justify-end border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12 text-xs text-neutral-400">
                <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold">
                  Inquiries
                </span>
                <p className="leading-relaxed font-light">
                  Direct concierge contact & tailored inquiries.
                </p>
                <div className="text-white font-mono">concierge@gregorio.com</div>
              </div>
            </div>

            {/* Footer Status */}
            <div className="border-t border-white/10 pt-6 flex items-center justify-between text-[11px] text-neutral-500 uppercase tracking-widest">
              <span>© {new Date().getFullYear()} GREGORIO</span>
              <span>PARIS / BALI / TOKYO</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
