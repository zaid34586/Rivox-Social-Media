import React from 'react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      {label ?? 'Working...'}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, accent = 'violet' }: { label: string; value: string | number; sub?: string; accent?: string }) {
  const colors: Record<string, string> = {
    violet: 'from-violet-500/20 to-transparent text-violet-300',
    cyan: 'from-cyan-500/20 to-transparent text-cyan-300',
    emerald: 'from-emerald-500/20 to-transparent text-emerald-300',
    amber: 'from-amber-500/20 to-transparent text-amber-300',
    fuchsia: 'from-fuchsia-500/20 to-transparent text-fuchsia-300',
  };
  return (
    <div className={`glass relative overflow-hidden p-5`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors[accent] ?? colors.violet} opacity-60 pointer-events-none`} />
      <div className="relative">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        {sub && <p className={`mt-1 text-xs ${colors[accent]?.split(' ').pop()}`}>{sub}</p>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = 'slate' }: { children: React.ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    slate: 'bg-white/10 text-slate-300',
    violet: 'bg-violet-500/20 text-violet-300',
    green: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300',
    red: 'bg-red-500/20 text-red-300',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone] ?? tones.slate}`}>{children}</span>;
}

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`glass scroll-thin max-h-[88vh] w-full overflow-y-auto p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
