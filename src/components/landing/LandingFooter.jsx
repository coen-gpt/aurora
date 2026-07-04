import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="border-t border-border/50 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Aurora. Bring your own content — Aurora never stores streams.</p>
        <div className="flex items-center gap-5">
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/login" className="hover:text-foreground transition-colors">Sign in</Link>
          <Link to="/register" className="hover:text-foreground transition-colors">Create account</Link>
        </div>
      </div>
    </footer>
  );
}