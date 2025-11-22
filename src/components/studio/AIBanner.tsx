'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface AIBannerProps {
  text: string;
}

// Framer Motion is not available, using CSS transitions
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function AIBanner({ text }: AIBannerProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (text) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 7000); // Hide after 7 seconds
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [text]);

  return (
    <div
      className={cn(
        'absolute bottom-8 left-8 transition-all duration-500 ease-in-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
    >
      {text && (
        <div className="flex items-center gap-4 bg-black/70 text-white p-3 pr-6 rounded-lg shadow-2xl backdrop-blur-sm border border-accent/30">
          <div className="p-2 bg-accent rounded-md">
            <Bot className="size-6 text-accent-foreground" />
          </div>
          <p className="font-medium text-lg">{text}</p>
        </div>
      )}
    </div>
  );
}
