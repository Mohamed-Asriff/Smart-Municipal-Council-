import React from 'react';
import { Bot } from 'lucide-react';

export const ChatbotButton = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      // translate-x-[80%]: Pushes 80% of the button off the right edge.
      // hover:translate-x-0: Slides fully into view when hovered.
      // pr-8 pl-6: Ensures the visible portion (20%) has space for the icon.
      className={`fixed bottom-10 right-0 z-40 bg-[#0B1E33] text-white pl-5 pr-8 py-3.5 rounded-l-full shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center gap-3 border-2 border-r-0 border-kmc-gold/30 hover:bg-kmc-navy hover:border-kmc-gold translate-x-[80%] hover:translate-x-0 group ${
        isOpen ? 'translate-x-full opacity-0' : ''
      }`}
      title="Open KMC AI Assistant"
    >
      {/* The icon sits on the left, which is the visible 20% */}
      <Bot className="w-6 h-6 text-kmc-gold group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
      
      {/* The text is hidden until hover reveals it */}
      <span className="font-bold text-sm tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
        KMC Assistant
      </span>
    </button>
  );
};