"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 border-t border-white/10 py-12 text-neutral-500 text-xs">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} Project Name. All rights reserved.</div>
        <div className="flex gap-6 uppercase tracking-wider">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
