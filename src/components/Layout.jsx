import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Tv, Radio, Gamepad2, Lightbulb, CalendarClock, Bookmark } from 'lucide-react';

const LOGO = 'https://media.base44.com/images/public/6a485551f0d60c9fa95dcd18/8f526db81_generated_image.png';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/player', label: 'Watch', icon: Tv },
  { to: '/guide', label: 'Guide', icon: CalendarClock },
  { to: '/mylist', label: 'My List', icon: Bookmark },
  { to: '/devices', label: 'Devices', icon: Radio },
  { to: '/remote', label: 'Remote', icon: Gamepad2 },
  { to: '/lighting', label: 'Lighting', icon: Lightbulb },
];

export default function Layout() {
  const topLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary/15 text-primary'
        : 'text-muted-foreground hover:text-foreground'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-[10px] font-medium transition-all duration-200 ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav — Netflix-style translucent bar */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={LOGO} alt="Aurora" className="w-9 h-9 rounded-xl shadow-[0_0_20px_hsl(var(--primary)/0.4)]" />
            <span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              AURORA
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={topLinkClass} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border flex justify-around px-2 py-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={mobileLinkClass} end={item.to === '/'}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}