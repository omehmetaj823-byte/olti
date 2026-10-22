import { Key, Star, Bell } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  onOpenApiModal: () => void;
  isLiveApi: boolean;
  onOpenNotificationModal?: () => void;
  subscribedCount?: number;
}

export function Header({
  activeTab,
  setActiveTab,
  favoritesCount,
  onOpenApiModal,
  isLiveApi,
  onOpenNotificationModal,
  subscribedCount = 0,
}: HeaderProps) {
  const navItems = [
    { id: 'matches', label: 'Ndeshjet' },
    { id: 'superliga', label: 'Superliga 🇦🇱' },
    { id: 'standings', label: 'Klasifikimi' },
    { id: 'stars', label: 'Kuqezinjtë' },
    {
      id: 'favorites',
      label: `Të Preferuarat${favoritesCount > 0 ? ` (${favoritesCount})` : ''}`,
      icon: Star,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-md shadow-red-950">
            🦅
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="font-display text-xl sm:text-2xl font-extrabold tracking-wider uppercase text-white group-hover:text-red-400 transition-colors">
              LIVE SCORE <span className="text-red-500">ALBANIA</span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 single-line clean navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap shrink-0 transition-colors relative py-1 focus:outline-none cursor-pointer ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Button */}
          <button
            onClick={onOpenNotificationModal}
            title="Cilësimet e Njoftimeve (Browser Push & Gola)"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Njoftimet</span>
            {subscribedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white leading-none">
                {subscribedCount}
              </span>
            )}
          </button>

          {/* API Settings Button */}
          <button
            onClick={onOpenApiModal}
            title="Konfiguro çelësin API të football-data.org / api-football.com"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Key className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Cilësimet e API</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveApi ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              title={isLiveApi ? 'Lidhur me Live API' : 'Modaliteti i pasur lokal'}
            />
          </button>
        </div>
      </div>

      {/* Mobile horizontal navigation bar */}
      <div className="md:hidden flex items-center overflow-x-auto gap-2 px-4 py-2 border-t border-slate-900 bg-slate-950/80 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
