import { useState } from 'react';

interface TeamCrestProps {
  name: string;
  tla?: string;
  crest?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Deterministic pleasing sports team colors based on team name
function getTeamColor(name: string): { bg: string; text: string; border: string } {
  const lower = name.toLowerCase();
  if (lower.includes('partizani')) return { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-600' };
  if (lower.includes('tirana')) return { bg: 'bg-blue-950', text: 'text-blue-400', border: 'border-blue-500' };
  if (lower.includes('vllaznia')) return { bg: 'bg-indigo-950', text: 'text-red-400', border: 'border-blue-600' };
  if (lower.includes('egnatia')) return { bg: 'bg-emerald-950', text: 'text-emerald-400', border: 'border-emerald-500' };
  if (lower.includes('dinamo')) return { bg: 'bg-sky-950', text: 'text-sky-400', border: 'border-sky-500' };
  if (lower.includes('skënderbeu') || lower.includes('skenderbeu')) return { bg: 'bg-red-950', text: 'text-white', border: 'border-red-600' };
  if (lower.includes('elbasani')) return { bg: 'bg-yellow-950', text: 'text-yellow-400', border: 'border-blue-500' };
  if (lower.includes('teuta')) return { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-400' };
  if (lower.includes('shqipëria') || lower.includes('albania')) return { bg: 'bg-red-950', text: 'text-red-200', border: 'border-red-500' };
  if (lower.includes('inter')) return { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-600' };
  if (lower.includes('atalanta')) return { bg: 'bg-blue-950', text: 'text-white', border: 'border-blue-500' };
  if (lower.includes('real madrid')) return { bg: 'bg-slate-900', text: 'text-yellow-400', border: 'border-yellow-500' };
  if (lower.includes('bayern')) return { bg: 'bg-red-950', text: 'text-red-300', border: 'border-red-600' };
  if (lower.includes('arsenal')) return { bg: 'bg-red-950', text: 'text-red-300', border: 'border-red-500' };
  if (lower.includes('barcelona')) return { bg: 'bg-indigo-950', text: 'text-rose-400', border: 'border-amber-500' };

  // Fallback hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [
    { bg: 'bg-slate-900', text: 'text-slate-300', border: 'border-slate-700' },
    { bg: 'bg-red-950', text: 'text-red-300', border: 'border-red-700' },
    { bg: 'bg-blue-950', text: 'text-blue-300', border: 'border-blue-700' },
    { bg: 'bg-emerald-950', text: 'text-emerald-300', border: 'border-emerald-700' },
    { bg: 'bg-purple-950', text: 'text-purple-300', border: 'border-purple-700' },
  ];
  return hues[Math.abs(hash) % hues.length];
}

export function TeamCrest({ name, tla, crest, size = 'md', className = '' }: TeamCrestProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const colors = getTeamColor(name);
  const initials = tla || name.substring(0, 3).toUpperCase();

  const isUrl = crest && (crest.startsWith('http://') || crest.startsWith('https://'));

  const dimensions = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-16 h-16 text-base font-bold',
  }[size];

  const imgDimensions = {
    sm: 'w-6 h-6 object-contain',
    md: 'w-8 h-8 object-contain',
    lg: 'w-12 h-12 object-contain',
  }[size];

  if (isUrl && !imageFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center rounded-xl bg-slate-900/90 border border-slate-800 p-1 shadow-xs select-none shrink-0 ${dimensions} ${className}`}
        title={name}
      >
        <img
          src={crest}
          alt={name}
          referrerPolicy="no-referrer"
          className={imgDimensions}
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl border font-mono font-bold tracking-tight shadow-sm select-none shrink-0 ${dimensions} ${colors.bg} ${colors.text} ${colors.border} ${className}`}
      title={name}
      aria-label={name}
    >
      <span className="truncate px-0.5">{initials}</span>
    </div>
  );
}
