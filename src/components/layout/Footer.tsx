"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

type FooterLink = { label: string; href: string; italic?: boolean };

interface FooterProps {
  heading?: string;
  menuTitle?: string;
  menuLinks?: FooterLink[];
  supportTitle?: string;
  supportLinks?: FooterLink[];
  onSubscribe?: (email: string) => void;
}

const DEFAULT_MENU: FooterLink[] = [
  { label: "Shop All", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Community", href: "#" },
  { label: "Vibes", href: "#", italic: true },
];

const DEFAULT_SUPPORT: FooterLink[] = [
  { label: "Shipping & Returns", href: "#" },
  { label: "Help & FAQ", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Contact", href: "#" },
];

/** Fades a section up into place the first time it scrolls into view.
 *  One deliberate entrance, not a per-element scroll gimmick. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      <a
        href={link.href}
        className={`group relative inline-block text-[15px] leading-8 text-neutral-300 transition-colors duration-300 hover:text-white ${link.italic ? "italic" : ""
          }`}
      >
        {link.label}
        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-[width] duration-300 ease-out group-hover:w-full" />
      </a>
    </li>
  );
}

function ScrollToTop() {
  const [lifted, setLifted] = useState(false);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => setLifted(true)}
      onMouseLeave={() => setLifted(false)}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition-colors duration-300 hover:border-white/40 hover:bg-white/5"
    >
      <ArrowUp
        className="h-4 w-4 transition-transform duration-300 ease-out"
        style={{ transform: lifted ? "translateY(-3px)" : "translateY(0)" }}
      />
    </button>
  );
}

export default function Footer({
  heading = "Get updates on fun stuff you probably want to know about in your inbox.",
  menuTitle = "Menu",
  menuLinks = DEFAULT_MENU,
  supportTitle = "Support",
  supportLinks = DEFAULT_SUPPORT,
  onSubscribe,
}: FooterProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubscribe?.(email);
    setSent(true);
    setEmail("");
    window.setTimeout(() => setSent(false), 2200);
  };

  return (
    <footer className="relative w-full overflow-hidden bg-black text-white">
      <div
        ref={ref}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-6 py-20 sm:px-10 md:grid-cols-[1.3fr_0.7fr_0.7fr] md:gap-10"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Heading + signup */}
        <div>
          <h2 className="max-w-md font-serif text-[28px] leading-[1.25] tracking-tight text-white sm:text-[32px]">
            {heading}
          </h2>

          <form onSubmit={handleSubmit} className="mt-10 max-w-sm">
            <div
              className="flex items-center justify-between border-b pb-3 transition-colors duration-300"
              style={{ borderColor: focused ? "#ffffff" : "rgba(255,255,255,0.25)" }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Email address"
                className="w-full bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="group ml-3 shrink-0 text-white"
              >
                <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
              </button>
            </div>
            <p
              className="mt-2 text-xs text-neutral-400"
              style={{
                opacity: sent ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              You're on the list.
            </p>
          </form>
        </div>

        {/* Menu */}
        <div>
          <p className="text-sm font-medium text-white">{menuTitle}</p>
          <ul className="mt-4">
            {menuLinks.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className="text-sm font-medium text-white">{supportTitle}</p>
          <ul className="mt-4">
            {supportLinks.map((link) => (
              <FooterLinkItem key={link.label} link={link} />
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-white/10 px-6 py-6 sm:px-10">
        <div className="flex items-center gap-5 text-neutral-400">
          <span className="text-[13px] font-medium tracking-tight text-neutral-300"> Pay</span>
          <span className="text-[13px] font-semibold italic text-neutral-300">PayPal</span>
          <span className="relative flex h-5 w-9 items-center rounded-full bg-neutral-700">
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-neutral-300" />
            <span className="absolute right-0.5 h-4 w-4 rounded-full bg-neutral-500" />
          </span>
          <span className="text-[13px] font-bold tracking-wide text-neutral-300">VISA</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {[InstagramIcon, TwitterIcon, FacebookIcon].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 ease-out hover:scale-110"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <ScrollToTop />
        </div>
      </div>
    </footer>
  );
}