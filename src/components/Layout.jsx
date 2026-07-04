import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Tv, Radio, Gamepad2, Lightbulb } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/player', label: 'Player', icon: Tv },
  { to: '/devices', label: 'Devices', icon: Radio },
  { to: '/remote', label: 'Remote', icon: Gamepad2 },
  { to: '/lighting', label: 'Lighting', icon: Lightbulb },
];

export default function Layout() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary/15 text-primary shadow-[0_0_20px_hsl(var(--primary)/0.15)]'
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex flex-col items-center gap-1 py-2 px-3 rounded-xl text-[10px] font-medium transition-all duration-200 ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border p-4 gap-1 sticky top-0 h-screen">
        <div className="flex items-center gap-2.5 px-3 py-4 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-fuchsia-500 flex items-center justify-center shadow-[0_0_24px_hsl(var(--primary)/0.4)]">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none tracking-tight">StreamHub</p>
            <p className="text-[10px] text-muted-foreground mt-1 tracking-widest uppercase">Media Center</p>
          </div>
        </div>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </aside>

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
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