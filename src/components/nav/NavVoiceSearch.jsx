import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

// Speak a channel or show title — jumps to the Player with the search prefilled.
export default function NavVoiceSearch() {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const navigate = useNavigate();

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
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.trim();
      if (text) navigate('/search', { state: { q: text } });
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <button
      onClick={start}
      title={listening ? 'Listening… say a channel or show name' : 'Voice search — say a channel or show name'}
      className={`p-2.5 rounded-full transition-all ${
        listening
          ? 'bg-primary text-primary-foreground animate-pulse shadow-[0_0_20px_hsl(var(--primary)/0.6)]'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
      }`}
    >
      <Search className="w-4 h-4" />
    </button>
  );
}