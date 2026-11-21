import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';
import { ShieldCheck, ChevronDown, User, Sparkles, LogIn, LogOut } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
  activePersonaName?: string;
  onOpenPersonaModal?: () => void;
  isAuthenticated?: boolean;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection = 'home',
  onNavigate,
  activePersonaName = 'Ramesh Kumar (Kirana)',
  onOpenPersonaModal,
  isAuthenticated = false,
  onOpenAuthModal,
  onLogout,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    return scrollY.on('change', (latest) => {
      setIsScrolled(latest > 30);
    });
  }, [scrollY]);

  const navLinks = [
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'stories', label: 'Interactive Story' },
    { id: 'for-businesses', label: 'For MSMEs' },
    { id: 'for-lenders', label: 'For Lenders' },
    { id: 'fairness', label: 'Fair Lending' },
  ];

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex flex-col items-center px-4 pointer-events-none">
      {/* Top Floating Capsule Nav */}
      <nav
        className={`pointer-events-auto relative overflow-hidden flex items-center justify-between w-full max-w-5xl h-14 px-5 rounded-full backdrop-blur-md border shadow-elevated text-brand-ivory transition-all duration-300 ${isScrolled
          ? 'bg-brand-charcoal/95 border-white/20 shadow-2xl scale-[0.99]'
          : 'bg-brand-charcoal/80 border-white/10'
          }`}
      >
        {/* Subtle Reading Progress Indicator Line inside Navbar Bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand-mint via-brand-terracotta to-brand-mint origin-left"
          style={{ scaleX }}
        />

        {/* Brand Logo */}
        <div
          onClick={() => onNavigate?.('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          {/* Stylized Double Loop / Infinity Knot Icon */}
          <div className="w-8 h-8 rounded-full bg-brand-forest flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
            <span className="font-display font-black text-sm tracking-tighter text-brand-mint">U</span>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-brand-mint transition-colors">
            UDYOGA
          </span>
        </div>

        {/* Center Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-white/80">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate?.(link.id)}
              className={`hover:text-brand-mint transition-colors py-1 relative ${activeSection === link.id ? 'text-brand-mint font-semibold' : ''
                }`}
            >
              {link.label}
              {activeSection === link.id && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-mint rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Right CTA & Persona Switcher */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Persona Quick Switch Pill */}
              <button
                onClick={onOpenPersonaModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white/90 border border-white/10 transition-colors"
                title="Switch demo persona"
              >
                <User className="w-3.5 h-3.5 text-brand-mint" />
                <span className="max-w-[130px] truncate">{activePersonaName}</span>
                <ChevronDown className="w-3 h-3 text-white/60" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-xs text-white/70 hover:text-white border border-white/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3 text-brand-terracotta" />
                  <span>Logout</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-brand-mint font-medium border border-white/15 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}

          {/* Primary CTA Button (Faithful to video pill CTA) */}
          <button
            onClick={() => onNavigate?.('apply')}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-terracotta text-white font-display font-semibold text-xs hover:bg-brand-terracotta-hover transition-all duration-200 active:scale-95 shadow-soft hover:shadow-glow-terracotta"
          >
            <span>Apply for Credit</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
