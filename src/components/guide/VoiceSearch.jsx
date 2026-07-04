import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';

export default function VoiceSearch({ onResult, className = '' }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => () => recRef.current?.abort(), []);

  if (!SR) return null;

  const start = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join('');
      onResult(text.trim());
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <button
      type="button"
      onClick={start}
      title={listening ? 'Stop listening' : 'Search by voice'}
      className={`p-2 rounded-full transition-all ${
        listening
          ? 'bg-primary text-primary-foreground animate-pulse shadow-[0_0_16px_hsl(var(--primary)/0.6)]'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
      } ${className}`}
    >
      <Mic className="w-4 h-4" />
    </button>
  );
}